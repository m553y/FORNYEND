import { useMemo, useState } from "react";
import PageHeader from "../Components/PageHeader";
import CheckoutStepper from "../Components/CheckoutStepper";
import { Icon } from "../Components/Icon";
import { money } from "../utils/format";
import { orderApi } from "../services/api";

const CARD_NUMBER_LIMIT = 16;

function cleanDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidCardDetails(card) {
  const digits = cleanDigits(card.number);
  const expiry = String(card.expiry || "").trim();
  const [monthRaw, yearRaw] = expiry.split("/");
  const month = Number(monthRaw);
  const year = Number(yearRaw);
  const ccv = cleanDigits(card.ccv);

  if (!card.name.trim()) return false;
  if (digits.length !== CARD_NUMBER_LIMIT) return false;
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  if (!Number.isFinite(month) || month < 1 || month > 12) return false;
  if (!Number.isFinite(year) || year < 0) return false;
  if (!/^(\d{3}|\d{4})$/.test(ccv)) return false;

  return true;
}

function productImageFromRecord(product) {
  if (!product || typeof product !== "object") return null;
  const fromColorImage = product.colorimage?.[0]?.images?.[0];
  if (fromColorImage) return fromColorImage;
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  if (Array.isArray(product.gallery) && product.gallery[0]) return product.gallery[0];
  return null;
}

function toPersistableImage(image) {
  if (!image || typeof image !== "string") return null;
  return image;
}

function buildOrderLine(entry, cartItem) {
  const populated =
    entry?.product && typeof entry.product === "object" ? entry.product : null;

  return {
    ...entry,
    name:
      entry.name ??
      populated?.name ??
      cartItem?.product?.name ??
      "Product",
    image:
      toPersistableImage(entry.image) ??
      toPersistableImage(productImageFromRecord(populated)) ??
      toPersistableImage(cartItem?.product?.image) ??
      null,
  };
}

function enrichOrderWithCartDetails(order, cartItems) {
  const products = (order.products ?? []).map((line, index) => {
    const productId = line.product?._id ?? line.product;
    const cartItem =
      cartItems.find(
        (item) => String(item.productId) === String(productId),
      ) ?? cartItems[index];

    return buildOrderLine(line, cartItem);
  });

  return { ...order, products };
}

function buildFallbackOrder(cartItems) {
  return {
    _id: `local-${Date.now()}`,
    id: `local-${Date.now()}`,
    status: "pending",
    products: cartItems.map((item) => ({
      product: item.productId,
      quantity: item.qty,
      price: item.product?.price ?? 0,
      name: item.product?.name ?? "Product",
      image: toPersistableImage(item.product?.image),
    })),
    createdAt: new Date().toISOString(),
  };
}

export default function CheckoutPage({ items, onBack, onQty, onOrderDone }) {
  const [method, setMethod] = useState("Mastercard");
  const [card, setCard] = useState({
    name: "Esther Howard",
    number: "1234 5678 9876 5432",
    expiry: "12/30",
    ccv: "123",
  });
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [items],
  );
  const discount = total * 0.06;
  const finalTotal = total - discount;

  const handleOrder = async () => {
    if (items.length === 0) return;
    setOrderError("");

    if (!isValidCardDetails(card)) {
      setOrderError(
        "Please enter a valid card number, expiry date, and security code.",
      );
      return;
    }

    const normalizedItems = items.filter(
      (item) =>
        item?.product &&
        Number.isFinite(item.product?.price) &&
        Number.isFinite(item.qty) &&
        item.qty >= 1,
    );

    if (normalizedItems.length === 0) {
      setOrderError(
        "Your cart is empty or the selected items are not available for checkout.",
      );
      return;
    }

    setPlacing(true);

    try {
      const payload = {
        products: normalizedItems.map((item) => ({
          product: item.productId,
          quantity: item.qty,
          price: item.product.price,
        })),
      };

      const data = await orderApi.create(payload);
      const createdOrder =
        data?.order ?? data?.data?.order ?? data?.data ?? data;

      if (createdOrder && typeof createdOrder === "object") {
        onOrderDone(enrichOrderWithCartDetails(createdOrder, normalizedItems));
        return;
      }

      onOrderDone(buildFallbackOrder(normalizedItems));
    } catch (err) {
      onOrderDone(buildFallbackOrder(normalizedItems));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="relative bg-[#fff5ca] py-7">
        <PageHeader title="" onBack={onBack} />
        <div className="-mt-20">
          <CheckoutStepper />
        </div>
      </div>

      <section className="mx-auto grid w-[min(1350px,calc(100%-88px))] grid-cols-[1fr_480px] gap-20 py-8 max-lg:grid-cols-1 max-sm:w-[calc(100%-32px)]">
        {/* ── Payment method ──────────────────────────────── */}
        <div>
          <h1 className="text-2xl text-slate-500">Payment method</h1>
          <div className="mt-6 rounded bg-white p-8 shadow-[0_8px_22px_rgba(15,23,42,.18)]">
            <div className="mx-auto w-[360px] max-w-full rounded-xl border bg-white p-5 shadow">
              <div className="rounded-xl bg-[#2f64a4] p-6 text-white">
                <div className="text-right text-2xl font-bold">N Bank</div>
                <div className="mt-10 text-2xl tracking-[.2em]">
                  1234 5678 9876 5432
                </div>
                <div className="mt-5 text-sm">AL HOLDER</div>
              </div>
            </div>

            <div className="mx-auto mt-8 grid max-w-[560px] gap-5">
              <label className="flex items-center justify-between text-xl">
                Use saved card:
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="h-10 w-64 rounded bg-slate-100 px-3"
                >
                  <option>Mastercard</option>
                  <option>Visa</option>
                  <option>American Express</option>
                </select>
              </label>
              <input
                className="h-10 rounded bg-slate-100 px-4"
                placeholder="Name on card"
                value={card.name}
                onChange={(e) =>
                  setCard((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <input
                className="h-10 rounded bg-slate-100 px-4"
                placeholder="Card number"
                value={card.number}
                maxLength={19}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                  setCard((prev) => ({ ...prev, number: formatted }));
                }}
              />
              <div className="grid grid-cols-2 gap-16">
                <input
                  className="h-10 rounded bg-slate-100 px-4"
                  placeholder="MM / YY"
                  value={card.expiry}
                  maxLength={5}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                    const formatted =
                      raw.length > 2
                        ? `${raw.slice(0, 2)}/${raw.slice(2)}`
                        : raw;
                    setCard((prev) => ({ ...prev, expiry: formatted }));
                  }}
                />
                <input
                  className="h-10 rounded bg-slate-100 px-4"
                  placeholder="CCV"
                  value={card.ccv}
                  maxLength={4}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setCard((prev) => ({ ...prev, ccv: raw }));
                  }}
                />
              </div>
              <div className="text-right text-xl font-black text-[#27489f]">
                VISA <span className="text-red-500">●</span>
                <span className="text-yellow-500">●</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Order summary ────────────────────────────────── */}
        <aside>
          <h2 className="text-2xl text-slate-500">Order summary</h2>
          <div className="mt-6 max-h-[300px] overflow-y-auto rounded border p-2">
            {items.map((item) => (
              <div
                key={item.lineId}
                className="grid grid-cols-[100px_1fr_36px] gap-4 border-b py-2"
              >
                <img
                  src={item.product.image}
                  alt=""
                  className="h-[86px] rounded bg-slate-100 object-contain p-2"
                />
                <div>
                  <h3 className="text-lg font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-slate-500">
                    {item.product.description?.slice(0, 38)}
                  </p>
                  <p className="mt-3 font-bold">{money(item.product.price)}</p>
                </div>
                <div className="grid overflow-hidden rounded shadow">
                  <button type="button" onClick={() => onQty(item.lineId, 1)}>
                    <Icon name="plus" />
                  </button>
                  <span className="grid place-items-center bg-[#fff5ca]">
                    {item.qty}
                  </span>
                  <button type="button" onClick={() => onQty(item.lineId, -1)}>
                    <Icon name="minus" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 space-y-5 text-2xl text-slate-600">
            <p className="flex justify-between">
              <span>Product total</span>
              <span>{money(total)}</span>
            </p>
            <hr />
            <p className="flex justify-between">
              <span>Discount</span>
              <span>%6 ({money(discount)})</span>
            </p>
            <hr />
            <p className="flex justify-between">
              <span>Delivery fee</span>
              <span>Free</span>
            </p>
            <hr />
            <p className="flex justify-between font-bold text-[#f1cb3f]">
              <span>Total</span>
              <span>{money(finalTotal)}</span>
            </p>
          </div>

          {orderError && (
            <p className="mt-4 text-center text-sm font-semibold text-red-600">
              {orderError}
            </p>
          )}

          <button
            type="button"
            onClick={handleOrder}
            disabled={placing || items.length === 0}
            className="mt-8 h-16 w-full rounded bg-[#f8d858] text-2xl font-bold text-slate-700 shadow disabled:opacity-60"
          >
            {placing ? "Placing Order…" : "Order"}
          </button>
        </aside>
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import FormField from "../Components/FormField";
import ChatButton from "../Components/ChatButton";
import trendCar from "../assets/trend-car-01.png";
import { orderApi, userApi } from "../services/api";
import { mapApiUser } from "../utils/productUtils";
import { money } from "../utils/format";

function extractOrderList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function orderId(order) {
  return order?._id ?? order?.id ?? null;
}

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://cargo-project-production.up.railway.app/api"
).replace(/\/api\/?$/, "");

function resolveImageUrl(image) {
  if (!image || typeof image !== "string") return null;
  if (
    image.startsWith("http") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }
  if (image.startsWith("/")) return `${API_ORIGIN}${image}`;
  return image;
}

function lineProductId(line) {
  return String(line?.product?._id ?? line?.product ?? "");
}

function productImageFromRecord(product) {
  if (!product || typeof product !== "object") return null;
  const fromColorImage = product.colorimage?.[0]?.images?.[0];
  if (fromColorImage) return resolveImageUrl(fromColorImage);
  if (product.image) return resolveImageUrl(product.image);
  if (Array.isArray(product.images) && product.images[0]) {
    return resolveImageUrl(product.images[0]);
  }
  return null;
}

function mergeProductLine(apiLine, savedLine) {
  const apiPopulated =
    apiLine?.product && typeof apiLine.product === "object" ? apiLine.product : null;
  const savedPopulated =
    savedLine?.product && typeof savedLine.product === "object"
      ? savedLine.product
      : null;

  return {
    ...(savedLine ?? {}),
    ...(apiLine ?? {}),
    product: apiPopulated ?? savedPopulated ?? apiLine?.product ?? savedLine?.product,
    name:
      apiLine?.name ??
      savedLine?.name ??
      apiPopulated?.name ??
      savedPopulated?.name,
    image:
      productImageFromRecord(apiPopulated) ??
      savedLine?.image ??
      productImageFromRecord(savedPopulated) ??
      apiLine?.image ??
      null,
  };
}

function mergeOrders(apiOrders, savedOrders) {
  const merged = new Map();

  apiOrders.forEach((order) => {
    const id = orderId(order);
    if (id) merged.set(String(id), order);
  });

  savedOrders.forEach((saved) => {
    const id = orderId(saved);
    if (!id) return;

    const apiOrder = merged.get(String(id));
    if (!apiOrder) {
      merged.set(String(id), saved);
      return;
    }

    const apiLines = apiOrder.products ?? [];
    const savedLines = saved.products ?? [];
    const products = apiLines.map((line, index) => {
      const savedLine =
        savedLines.find((entry) => lineProductId(entry) === lineProductId(line)) ??
        savedLines[index];
      return mergeProductLine(line, savedLine);
    });

    merged.set(String(id), {
      ...saved,
      ...apiOrder,
      products,
      userId: saved.userId ?? apiOrder.userId,
    });
  });

  return Array.from(merged.values()).sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime(),
  );
}

function findCatalogProduct(line, catalog) {
  const productId = lineProductId(line);
  if (productId) {
    const byId = catalog.find((product) => String(product.id) === productId);
    if (byId) return byId;
  }

  const name = line.name ?? line.product?.name;
  if (name) {
    return catalog.find((product) => product.name === name) ?? null;
  }

  return null;
}

function getOrderLineDisplay(line, catalog = []) {
  const populated =
    line?.product && typeof line.product === "object" ? line.product : null;

  let name = line.name ?? populated?.name ?? "Product";
  let image =
    productImageFromRecord(populated) ?? resolveImageUrl(line.image);

  const match = findCatalogProduct(line, catalog);
  if (!image) {
    image = match.image?.startsWith("/src/")
      ? match.image
      : resolveImageUrl(match.image);
  }

  return {
    name,
    image,
    quantity: line.quantity ?? 1,
    price: line.price ?? 0,
  };
}

function orderTotal(order) {
  if (Number.isFinite(order.totalPrice)) return order.totalPrice;
  return (order.products ?? []).reduce(
    (sum, line) => sum + (line.price ?? 0) * (line.quantity ?? 1),
    0,
  );
}

export default function ProfilePage({
  user,
  savedOrders = [],
  products = [],
  onSave,
  onLogout,
  onChat,
  onAdmin,
}) {
  const [form, setForm] = useState(user);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    setForm(user);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    userApi
      .getById(user.id)
      .then((data) => {
        const refreshed = mapApiUser(data?.user ?? data);
        if (refreshed) {
          setForm((prev) => ({ ...prev, ...refreshed }));
        }
      })
      .catch(() => {
        setForm((prev) => prev ?? user);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const userSavedOrders = savedOrders.filter(
      (order) => !order.userId || order.userId === user.id,
    );

    setOrdersLoading(true);
    orderApi
      .getMine()
      .then((data) => {
        setOrders(mergeOrders(extractOrderList(data), userSavedOrders));
      })
      .catch(() => {
        setOrders(mergeOrders([], userSavedOrders));
      })
      .finally(() => setOrdersLoading(false));
  }, [user, savedOrders]);

  const update = (key) => (event) =>
    setForm((value) => ({ ...value, [key]: event.target.value }));

  const handleSave = async () => {
    if (!user?.id) {
      onSave(form);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const username =
      `${form.firstName?.trim() ?? ""} ${form.lastName?.trim() ?? ""}`.trim();

    try {
      const data = await userApi.update(user.id, {
        username: username || form.username,
        email: form.email?.trim().toLowerCase(),
      });

      const updated = mapApiUser(data?.user ?? { ...form, username });
      onSave({ ...form, ...updated });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-[min(1280px,calc(100%-80px))] pb-16 pt-9 max-sm:w-[calc(100%-32px)]">
      <section className="text-center">
        <img
          src={trendCar}
          alt="Profile car"
          className="mx-auto h-[240px] w-[240px] rounded-full border-2 border-[#27489f] object-cover"
        />
        <h1 className="mt-5 text-[32px] font-bold">
          {form.firstName} {form.lastName}
        </h1>
        <p className="text-xl text-slate-500">{form.email}</p>
        {form.role ? (
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#27489f]">
            {form.role}
          </p>
        ) : null}
        {form.role === "admin" && onAdmin ? (
          <button
            type="button"
            onClick={onAdmin}
            className="mt-4 h-11 rounded-full bg-[#27489f] px-8 font-bold text-white"
          >
            Open Admin Dashboard
          </button>
        ) : null}
      </section>
      <div className="mt-9 border-t border-slate-300 pt-8">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="First Name"
            value={form.firstName || ""}
            onChange={update("firstName")}
            placeholder="Enter First Name"
          />
          <FormField
            label="Last Name"
            value={form.lastName || ""}
            onChange={update("lastName")}
            placeholder="Enter Last Name"
          />
        </div>
        <div className="mt-5 space-y-5">
          <FormField
            label="Address"
            value={form.address || ""}
            onChange={update("address")}
            placeholder="Your address"
          />
          <FormField
            label="Phone Number"
            value={form.phone || ""}
            onChange={update("phone")}
            placeholder="+1 (555) 123-4567"
          />
          <FormField
            label="E-Mail"
            value={form.email || ""}
            onChange={update("email")}
            placeholder="example@gmail.com"
          />
          <FormField
            label="Language"
            value={form.language || ""}
            onChange={update("language")}
            placeholder="English"
          />
        </div>

        {error ? (
          <p className="mt-4 font-semibold text-red-600">{error}</p>
        ) : null}
        {message ? (
          <p className="mt-4 font-semibold text-green-600">{message}</p>
        ) : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-5 h-11 w-full rounded-full bg-[#27489f] font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 h-11 w-full rounded-full border border-red-500 font-bold text-red-500"
        >
          Log Out
        </button>
      </div>

      <section className="mt-12 border-t border-slate-300 pt-8">
        <h2 className="text-2xl font-bold">My Orders</h2>
        {ordersLoading ? (
          <p className="mt-4 text-slate-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-slate-400">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order, index) => (
              <div
                key={
                  order._id ?? order.id ?? `${order.status ?? "order"}-${index}`
                }
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#27489f]">
                    Order #
                    {String(order._id ?? order.id ?? `#${index + 1}`).slice(-6)}
                  </p>
                  <span className="rounded-full bg-[#e8eeff] px-3 py-1 text-xs font-bold uppercase text-[#27489f]">
                    {order.status ?? "pending"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {(order.products ?? []).length} item(s) · {money(orderTotal(order))}
                </p>
                <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {(order.products ?? []).map((line, lineIndex) => {
                    const { name, image, quantity, price } = getOrderLineDisplay(
                      line,
                      products,
                    );
                    return (
                      <li
                        key={`${orderId(order) ?? index}-line-${lineIndex}`}
                        className="flex items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qty {quantity} · {money(price * quantity)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <ChatButton onClick={onChat} />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import BrandLogo from "../Components/BrandLogo";
import FormField from "../Components/FormField";
import { categories } from "../Lib/appData";
import { productApi } from "../services/api";
import { extractProductList } from "../utils/productUtils";
import { money } from "../utils/format";
import { productImage } from "../utils/adminUtils";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
];

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  category: "rims",
  price: "",
  stock: "",
  color: "Default",
  carsforproduct: "",
};

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#27489f]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function ProductFormModal({ open, initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name ?? "",
        description: initial.description ?? "",
        category: initial.category ?? initial.categoryId ?? "rims",
        price: String(initial.price ?? ""),
        stock: String(initial.stock ?? ""),
        color: initial.colorimage?.[0]?.color ?? "Default",
        carsforproduct: (initial.carsforproduct ?? [])
          .map((c) => c.name ?? c)
          .join(", "),
      });
    } else {
      setForm(EMPTY_PRODUCT);
    }
    setFiles([]);
  }, [open, initial]);

  if (!open) return null;

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ form, files, isEdit: Boolean(initial) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-bold text-[#27489f]">
          {initial ? "Edit Product" : "Add Product"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FormField
            label="Name"
            value={form.name}
            onChange={update("name")}
            placeholder="Product name"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={update("description")}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#27489f]"
              placeholder="Product description"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Category
            </span>
            <select
              value={form.category}
              onChange={update("category")}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Price (EGP)"
              value={form.price}
              onChange={update("price")}
              placeholder="0"
              type="number"
            />
            <FormField
              label="Stock"
              value={form.stock}
              onChange={update("stock")}
              placeholder="0"
              type="number"
            />
          </div>
          <FormField
            label="Color"
            value={form.color}
            onChange={update("color")}
            placeholder="Default"
          />
          <FormField
            label="Compatible Cars"
            value={form.carsforproduct}
            onChange={update("carsforproduct")}
            placeholder="Toyota Camry, Honda Civic"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Images {initial ? "(optional — replaces if provided)" : ""}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="w-full text-sm"
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-full border border-slate-300 font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 flex-1 rounded-full bg-[#27489f] font-bold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : initial ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function buildProductFormData(form, files) {
  const fd = new FormData();
  fd.append("name", form.name.trim());
  fd.append("description", form.description.trim());
  fd.append("category", form.category);
  fd.append("price", String(Number(form.price)));
  fd.append("stock", String(Number(form.stock)));
  fd.append("color", form.color.trim() || "Default");
  const cars = form.carsforproduct
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  cars.forEach((name, index) => {
    fd.append(`carsforproduct[${index}][name]`, name);
  });
  files.forEach((file) => fd.append("images", file));
  return fd;
}

export default function SellerDashboardPage({
  user,
  onBack,
  onLogout,
  onProductsChanged,
}) {
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [products, setProducts] = useState([]);

  const [productQuery, setProductQuery] = useState("");

  const [productForm, setProductForm] = useState({ open: false, product: null });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const loadAll = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const productsRes = await productApi.seller.getAll();

    const productsList = extractProductList(productsRes);

    setProducts(productsList);
  } catch (err) {
    setError(err.message || "Failed to load seller data.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stats = useMemo(() => {
  const lowStock = products.filter(
    (p) => Number(p.stock ?? 0) < 5
  ).length;

  return {
    products: products.length,
    lowStock,
  };
}, [products]);


  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }, [products, productQuery]);

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSaveProduct = async ({ form, files, isEdit }) => {
    setSaving(true);
    setError("");
    try {
      const fd = buildProductFormData(form, files);
      if (isEdit && productForm.product) {
        const id = productForm.product._id ?? productForm.product.id;
        await productApi.seller.patch(id, fd);
        flash("Product updated.");
      } else {
        if (files.length === 0) {
          setError("Please upload at least one product image.");
          setSaving(false);
          return;
        }
        await productApi.create(fd);
        flash("Product created.");
      }
      setProductForm({ open: false, product: null });
      await loadAll();
      onProductsChanged?.();
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setActionId(id);
    try {
      await productApi.seller.remove(id);
      setProducts((list) =>
        list.filter((p) => String(p._id ?? p.id) !== id),
      );
      flash("Product deleted.");
      onProductsChanged?.();
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo size="text-[36px]" />
            <div>
              <h1 className="text-lg font-bold text-[#27489f]">
                Seller Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Signed in as {user?.username || user?.email}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="h-10 rounded-full border border-[#27489f] px-4 text-sm font-semibold text-[#27489f] disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onBack}
              className="h-10 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-600"
            >
              Store
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="h-10 rounded-full bg-red-500 px-4 text-sm font-bold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 max-lg:flex-col">
        <aside className="w-full shrink-0 lg:w-56">
          <nav className="space-y-1 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  section === item.id
                    ? "bg-[#27489f] text-white"
                    : "text-slate-600 hover:bg-[#edf3ff]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {error ? (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
              <button
                type="button"
                onClick={() => setError("")}
                className="ml-3 underline"
              >
                Dismiss
              </button>
            </div>
          ) : null}
          {message ? (
            <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {message}
            </div>
          ) : null}

{section === "overview" ? (
  <div className="grid gap-4 sm:grid-cols-2">
    <StatCard
      label="My Products"
      value={stats.products}
    />

    <StatCard
      label="Low Stock"
      value={stats.lowStock}
      hint="Stock below 5"
    />
  </div>
) : null}


          {section === "products" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  Product Management
                </h2>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Search products…"
                    className="h-10 rounded-full border border-slate-200 px-4 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setProductForm({ open: true, product: null })}
                    className="h-10 rounded-full bg-[#27489f] px-5 text-sm font-bold text-white"
                  >
                    + Add Product
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold">Stock</th>
                      <th className="px-4 py-3 font-semibold">Rating</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const id = String(p._id ?? p.id);
                      const img = productImage(p);
                      return (
                        <tr key={id} className="border-t border-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {img ? (
                                <img
                                  src={img}
                                  alt=""
                                  className="h-10 w-10 rounded-lg object-contain bg-slate-50"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-slate-100" />
                              )}
                              <span className="font-medium">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize">{p.category}</td>
                          <td className="px-4 py-3">{money(p.price)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                Number(p.stock) < 5
                                  ? "font-bold text-red-500"
                                  : ""
                              }
                            >
                              {p.stock ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {Number(p.averageRating ?? 0).toFixed(1)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setProductForm({ open: true, product: p })
                                }
                                className="font-semibold text-[#27489f]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={actionId === id}
                                onClick={() => handleDeleteProduct(id)}
                                className="font-semibold text-red-500 disabled:opacity-40"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredProducts.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">
                    No products found.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </main>
      </div>

      <ProductFormModal
        open={productForm.open && section === "products"}
        initial={productForm.product}
        onClose={() => setProductForm({ open: false, product: null })}
        onSave={handleSaveProduct}
        saving={saving}
      />
    </div>
  );
}

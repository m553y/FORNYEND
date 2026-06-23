import { useCallback, useEffect, useMemo, useState } from "react";
import BrandLogo from "../Components/BrandLogo";
import FormField from "../Components/FormField";
import { categories } from "../Lib/appData";
import {
  orderApi,
  productApi,
  reviewApi,
  userApi,
} from "../services/api";
import { extractProductList } from "../utils/productUtils";
import { money } from "../utils/format";
import {
  extractOrders,
  extractReviews,
  extractUsers,
  formatDate,
  ORDER_STATUSES,
  productImage,
} from "../utils/adminUtils";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "reviews", label: "Reviews" },
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

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-amber-100 text-amber-800",
    shipping: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    admin: "bg-purple-100 text-purple-800",
    seller: "bg-slate-100 text-slate-700",
  };
  const key = (status ?? "pending").toLowerCase();
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${colors[key] ?? "bg-slate-100 text-slate-600"}`}
    >
      {status ?? "—"}
    </span>
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

export default function AdminDashboardPage({
  user,
  onBack,
  onLogout,
  onProductsChanged,
}) {
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [userQuery, setUserQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [orderQuery, setOrderQuery] = useState("");

  const [productForm, setProductForm] = useState({ open: false, product: null });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, productsRes, ordersRes, reviewsRes] =
        await Promise.all([
          userApi.getAll(),
          productApi.getAll().catch(() => []),
          orderApi.getAll(),
          reviewApi.getAll(),
        ]);
      setUsers(extractUsers(usersRes));
      setProducts(extractProductList(productsRes));
      setOrders(extractOrders(ordersRes));
      setReviews(extractReviews(reviewsRes));
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stats = useMemo(() => {
    const revenue = orders.reduce(
      (sum, o) => sum + Number(o.totalPrice ?? 0),
      0,
    );
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const lowStock = products.filter((p) => Number(p.stock ?? 0) < 5).length;
    const sellers = users.filter((u) => u.role === "seller").length;
    return {
      users: users.length,
      sellers,
      products: products.length,
      orders: orders.length,
      revenue,
      pendingOrders,
      lowStock,
      reviews: reviews.length,
    };
  }, [users, products, orders, reviews]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    );
  }, [users, userQuery]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }, [products, productQuery]);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const id = String(o._id ?? o.id ?? "");
      const email = o.user?.email ?? "";
      const status = o.status ?? "";
      return (
        id.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q)
      );
    });
  }, [orders, orderQuery]);

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteUser = async (id) => {
    if (id === user?.id) {
      setError("You cannot delete your own account.");
      return;
    }
    if (!window.confirm("Delete this user permanently?")) return;
    setActionId(id);
    try {
      await userApi.remove(id);
      setUsers((list) => list.filter((u) => String(u._id ?? u.id) !== id));
      flash("User deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setActionId(null);
    }
  };

  const handleSaveProduct = async ({ form, files, isEdit }) => {
    setSaving(true);
    setError("");
    try {
      const fd = buildProductFormData(form, files);
      if (isEdit && productForm.product) {
        const id = productForm.product._id ?? productForm.product.id;
        await productApi.patch(id, fd);
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
      await productApi.remove(id);
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

  const handleOrderStatus = async (id, status) => {
    setActionId(id);
    try {
      const res = await orderApi.updateStatus(id, status);
      const updated = res?.order ?? res;
      setOrders((list) =>
        list.map((o) =>
          String(o._id ?? o.id) === id
            ? { ...o, status: updated?.status ?? status }
            : o,
        ),
      );
      flash("Order status updated.");
    } catch (err) {
      setError(err.message || "Failed to update order.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setActionId(id);
    try {
      await reviewApi.remove(id);
      setReviews((list) =>
        list.filter((r) => String(r._id ?? r.id) !== id),
      );
      flash("Review deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete review.");
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
                Admin Dashboard
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

          {loading && section === "overview" ? (
            <p className="text-slate-500">Loading dashboard…</p>
          ) : null}

          {section === "overview" ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Users" value={stats.users} />
                <StatCard label="Sellers" value={stats.sellers} />
                <StatCard label="Products" value={stats.products} />
                <StatCard label="Orders" value={stats.orders} />
                <StatCard
                  label="Total Revenue"
                  value={money(stats.revenue)}
                />
                <StatCard
                  label="Pending Orders"
                  value={stats.pendingOrders}
                  hint="Needs attention"
                />
                <StatCard
                  label="Low Stock Items"
                  value={stats.lowStock}
                  hint="Stock below 5"
                />
                <StatCard label="Reviews" value={stats.reviews} />
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <h3 className="font-bold text-slate-800">Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">No orders yet.</p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr className="border-b text-slate-500">
                          <th className="pb-2 pr-4 font-semibold">Order</th>
                          <th className="pb-2 pr-4 font-semibold">Customer</th>
                          <th className="pb-2 pr-4 font-semibold">Total</th>
                          <th className="pb-2 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr
                            key={order._id ?? order.id}
                            className="border-b border-slate-50"
                          >
                            <td className="py-3 pr-4 font-medium">
                              #{String(order._id ?? order.id).slice(-6)}
                            </td>
                            <td className="py-3 pr-4">
                              {order.user?.email ?? order.user?.username ?? "—"}
                            </td>
                            <td className="py-3 pr-4">
                              {money(order.totalPrice)}
                            </td>
                            <td className="py-3">
                              <StatusBadge status={order.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {section === "users" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  User Management
                </h2>
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search users…"
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm outline-none"
                />
              </div>
              <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Username</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Joined</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const id = String(u._id ?? u.id);
                      return (
                        <tr key={id} className="border-t border-slate-50">
                          <td className="px-4 py-3 font-medium">
                            {u.username}
                          </td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={u.role} />
                          </td>
                          <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              disabled={
                                actionId === id || id === user?.id
                              }
                              onClick={() => handleDeleteUser(id)}
                              className="text-sm font-semibold text-red-500 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">
                    No users found.
                  </p>
                ) : null}
              </div>
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

          {section === "orders" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  Order Management
                </h2>
                <input
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Search orders…"
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm outline-none"
                />
              </div>
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <p className="text-slate-400">No orders found.</p>
                ) : (
                  filteredOrders.map((order) => {
                    const id = String(order._id ?? order.id);
                    return (
                      <div
                        key={id}
                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-[#27489f]">
                              Order #{id.slice(-6)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {order.user?.email ?? order.user?.username ?? "—"}{" "}
                              · {formatDate(order.createdAt)} ·{" "}
                              {money(order.totalPrice)}
                            </p>
                          </div>
                          <select
                            value={order.status ?? "pending"}
                            disabled={actionId === id}
                            onChange={(e) =>
                              handleOrderStatus(id, e.target.value)
                            }
                            className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold outline-none"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                          {(order.products ?? []).map((line, idx) => {
                            const prod =
                              typeof line.product === "object"
                                ? line.product
                                : null;
                            const img = productImage(prod);
                            return (
                              <li
                                key={`${id}-line-${idx}`}
                                className="flex items-center gap-3 text-sm"
                              >
                                {img ? (
                                  <img
                                    src={img}
                                    alt=""
                                    className="h-10 w-10 rounded-lg object-contain bg-slate-50"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-slate-100" />
                                )}
                                <span className="flex-1 font-medium">
                                  {prod?.name ?? "Product"}
                                </span>
                                <span className="text-slate-500">
                                  ×{line.quantity}
                                </span>
                                <span>{money(line.price * line.quantity)}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {section === "reviews" ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                Review Moderation
              </h2>
              <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Rating</th>
                      <th className="px-4 py-3 font-semibold">Comment</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => {
                      const id = String(r._id ?? r.id);
                      return (
                        <tr key={id} className="border-t border-slate-50">
                          <td className="px-4 py-3 font-medium">
                            {r.product?.name ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {r.user?.username ?? r.user?.email ?? "—"}
                          </td>
                          <td className="px-4 py-3">{r.rating}/5</td>
                          <td className="max-w-xs truncate px-4 py-3">
                            {r.comment}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              disabled={actionId === id}
                              onClick={() => handleDeleteReview(id)}
                              className="font-semibold text-red-500 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {reviews.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">
                    No reviews yet.
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

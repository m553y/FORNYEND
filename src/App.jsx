import { useCallback, useEffect, useMemo, useState } from "react";
import TopBar from "./Components/TopBar";
import ChatButton from "./Components/ChatButton";
import { categories, products as staticProducts } from "./Lib/appData";
import {
  STORAGE_KEYS,
  clearStore,
  readStore,
  writeStore,
} from "./Storage/localStorag";
import SplashPage from "./Pages/SplashPage";
import OnboardingPage from "./Pages/OnboardingPage";
import { LoginPage, SignUpPage } from "./Pages/AuthPages";
import OtpPage from "./Pages/OtpPage";
import HomeStorePage from "./Pages/HomeStorePage";
import CategoriesPage from "./Pages/CategoriesPage";
import FavoritesPage from "./Pages/FavoritesPage";
import ProductListPage from "./Pages/ProductListPage";
import ProductDetailsPage from "./Pages/ProductDetailsPage";
import ProfilePage from "./Pages/ProfilePage";
import CartPage from "./Pages/CatrtPage";
import CheckoutPage from "./Pages/CheckoutPage";
import ChatbotPage from "./Pages/ChatBot";
import AiFixingPage from "./Pages/AiFixingPage";
import AdminDashboardPage from "./Pages/AdminDashboardPage";
import { demoUser } from "./Lib/appData";
import { fetchProductsByRole, getToken, removeToken } from "./services/api";
import { mapApiUser, normaliseProduct } from "./utils/productUtils";

function makeLine(product, options = {}) {
  return {
    lineId: `${product.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    productId: product.id,
    qty: 1,
    color: options.color || product.colors?.[0],
    size: options.size || product.sizes?.[0],
  };
}

function isAuthError(err) {
  const msg = (err?.message ?? "").toLowerCase();
  return (
    msg.includes("unauthorized") ||
    msg.includes("401") ||
    msg.includes("logged in")
  );
}

export default function App() {
  const [boot, setBoot] = useState("dark");
  const [page, setPage] = useState("signup");
  const [otpInitial, setOtpInitial] = useState("");
  const [user, setUser] = useState(() => {
    const stored = readStore(STORAGE_KEYS.user, null);
    if (stored && !getToken()) return null;
    return stored;
  });
  const [users, setUsers] = useState(() => readStore(STORAGE_KEYS.users, []));
  const [cart, setCart] = useState(() => readStore(STORAGE_KEYS.cart, []));
  const [favorites, setFavorites] = useState(() =>
    readStore(STORAGE_KEYS.favorites, []),
  );
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(18);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [orderDone, setOrderDone] = useState(false);
  const [orders, setOrders] = useState(() => readStore(STORAGE_KEYS.orders, []));
  const [apiError, setApiError] = useState("");

  const [apiProducts, setApiProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const go = useCallback((nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAuthFailure = useCallback(() => {
    setUser(null);
    removeToken();
    clearStore(STORAGE_KEYS.user);
    go("login");
  }, [go]);

  const loadProducts = useCallback(
    async (searchQuery = "") => {
      setProductsLoading(true);
      setApiError("");
      try {
        const role = user?.role ?? "seller";
        const list = await fetchProductsByRole(role, searchQuery);
        if (list.length > 0) {
          setApiProducts(list.map(normaliseProduct));
        } else {
          setApiProducts([]);
        }
      } catch (err) {
        if (isAuthError(err)) {
          handleAuthFailure();
        } else {
          console.warn(
            "Could not load products from server:",
            err.message || err,
          );
        }
      } finally {
        setProductsLoading(false);
      }
    },
    [user?.role, handleAuthFailure],
  );

  // Fetch products when user logs in or search changes (debounced)
  useEffect(() => {
    if (!user) {
      setApiProducts([]);
      return;
    }
    const timer = setTimeout(() => loadProducts(search), 350);
    return () => clearTimeout(timer);
  }, [user, search, loadProducts]);

  const allProducts = apiProducts.length > 0 ? apiProducts : staticProducts;

  useEffect(() => {
    const first = setTimeout(() => setBoot("light"), 1000);
    const second = setTimeout(() => {
      setBoot("ready");
      const onboarded = readStore(STORAGE_KEYS.onboarded, false);
      const storedUser = readStore(STORAGE_KEYS.user, null);
      const hasSession = storedUser && getToken();
      if (!onboarded) {
        setPage("onboarding");
      } else if (hasSession) {
        setPage("home");
      } else {
        setPage("signup");
      }
    }, 2100);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, []);

  useEffect(() => writeStore(STORAGE_KEYS.user, user), [user]);
  useEffect(() => writeStore(STORAGE_KEYS.users, users), [users]);
  useEffect(() => writeStore(STORAGE_KEYS.cart, cart), [cart]);
  useEffect(() => writeStore(STORAGE_KEYS.favorites, favorites), [favorites]);
  useEffect(() => writeStore(STORAGE_KEYS.orders, orders), [orders]);

  useEffect(() => {
    if (page === "admin" && user?.role !== "admin") {
      go("home");
    }
  }, [page, user?.role, go]);

  const cartItems = useMemo(
    () =>
      cart.map((item) => ({
        ...item,
        product:
          allProducts.find((p) => p.id === item.productId) || allProducts[0],
      })),
    [cart, allProducts],
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const selectedProduct =
    allProducts.find((p) => p.id === selectedProductId) || allProducts[0];

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allProducts.filter((p) => {
      const categoryMatch = selectedCategory
        ? p.categoryId === selectedCategory.id
        : true;
      const searchMatch =
        !query ||
        [p.name, p.categoryId, p.description]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return categoryMatch && searchMatch;
    });
  }, [search, selectedCategory, allProducts]);

  const homeProducts = filteredProducts.slice(0, visible);

  const completeOnboarding = () => {
    writeStore(STORAGE_KEYS.onboarded, true);
    go(user && getToken() ? "home" : "signup");
  };

  const openProduct = (product) => {
    setSelectedProductId(product.id);
    go("details");
  };

  const toggleFavorite = (productId) => {
    setFavorites((items) =>
      items.includes(productId)
        ? items.filter((id) => id !== productId)
        : [...items, productId],
    );
  };

  const addToCart = (product, options = {}) => {
    setCart((items) => [...items, makeLine(product, options)]);
  };

  const buyNow = (product, options = {}) => {
    addToCart(product, options);
    go("cart");
  };

  const changeQty = (lineId, delta) => {
    setCart((items) =>
      items
        .map((item) =>
          item.lineId === lineId
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const handleSignup = ({ ok, user: newUser }) => {
    if (!ok) return;
    const mapped = mapApiUser(newUser);
    setUsers((items) => [
      ...items.filter((u) => u.email !== mapped.email),
      mapped,
    ]);
    setUser(mapped);
    go("home");
  };

  const handleLogin = ({ ok, user: loggedIn }) => {
    if (!ok) return;
    setUser(mapApiUser(loggedIn));
    go("home");
  };

  const handleSocial = (provider) => {
    alert(
      `${provider} sign-in is a demo only. Please use email registration to connect to the backend.`,
    );
  };

  const logout = () => {
    setUser(null);
    removeToken();
    clearStore(STORAGE_KEYS.user);
    setApiProducts([]);
    go("login");
  };

  const pageWithShell = (active, content) => (
    <main className="min-h-screen bg-[#fbfbfc]">
      <TopBar
        active={active}
        search={search}
        cartCount={cartCount}
        onSearch={setSearch}
        onCart={() => go("cart")}
        onNavigate={(target) => {
          if (target === "categories") setSelectedCategory(null);
          if (target === "admin" && user?.role !== "admin") return;
          go(target);
        }}
        showAdmin={user?.role === "admin"}
      />
      {content}
      <ChatButton onClick={() => go("chat")} />
    </main>
  );

  if (boot === "dark") return <SplashPage variant="dark" />;
  if (boot === "light") return <SplashPage variant="light" />;
  if (page === "onboarding")
    return <OnboardingPage onFinish={completeOnboarding} />;

  if (page === "signup")
    return (
      <SignUpPage
        onSubmit={handleSignup}
        onLogin={() => go("login")}
        onSocial={handleSocial}
      />
    );

  if (page === "login")
    return (
      <LoginPage
        onSubmit={handleLogin}
        onSignup={() => go("signup")}
        onSocial={handleSocial}
        onOtp={(email) => {
          setOtpInitial(email);
          go("otp");
        }}
      />
    );

  if (page === "otp")
    return (
      <OtpPage
        initial={otpInitial}
        onBack={() => go("login")}
        onDone={() => go("login")}
      />
    );

  if (page === "cart")
    return (
      <CartPage
        items={cartItems}
        onBack={() => go("home")}
        onQty={changeQty}
        onDeleteAll={() => setCart([])}
        onFavorite={toggleFavorite}
        onBuy={() => (cartItems.length ? go("checkout") : go("home"))}
        onChat={() => go("chat")}
      />
    );

  if (page === "checkout")
    return (
      <CheckoutPage
        items={cartItems}
        user={user || demoUser}
        onBack={() => go("cart")}
        onQty={changeQty}
        onOrderDone={(createdOrder) => {
          setCart([]);
          if (createdOrder) {
            const orderWithUser = {
              ...createdOrder,
              userId: user?.id ?? null,
              createdAt: createdOrder.createdAt ?? new Date().toISOString(),
            };
            setOrders((prev) => {
              const id = orderWithUser._id ?? orderWithUser.id;
              if (prev.some((order) => (order._id ?? order.id) === id)) {
                return prev;
              }
              return [orderWithUser, ...prev];
            });
          }
          setOrderDone(true);
          go("home");
          setTimeout(() => {
            setOrderDone(false);
          }, 3000);
        }}
      />
    );

  if (page === "chat")
    return (
      <ChatbotPage
        user={user || demoUser}
        onBack={() => go("home")}
        onAnalyze={() => go("ai")}
      />
    );

  if (page === "ai")
    return (
      <AiFixingPage
        products={allProducts}
        favorites={favorites}
        onBack={() => go("chat")}
        onProduct={openProduct}
        onFavorite={toggleFavorite}
      />
    );

  if (page === "details") {
    return (
      <ProductDetailsPage
        product={selectedProduct}
        user={user || demoUser}
        favorite={favorites.includes(selectedProduct?.id)}
        onBack={() => go(selectedCategory ? "productList" : "home")}
        onFavorite={toggleFavorite}
        onCart={addToCart}
        onBuy={buyNow}
        onChat={() => go("chat")}
      />
    );
  }

  if (page === "productList") {
    const title = selectedCategory?.title || "Products";
    return (
      <ProductListPage
        title={title}
        products={filteredProducts}
        favorites={favorites}
        search={search}
        onSearch={setSearch}
        onBack={() => go("categories")}
        onCart={() => go("cart")}
        onFavorite={toggleFavorite}
        onProduct={openProduct}
      />
    );
  }

  if (page === "categories") {
    return pageWithShell(
      "categories",
      <CategoriesPage
        categories={categories}
        onOpen={(category) => {
          setSelectedCategory(category);
          go("productList");
        }}
      />,
    );
  }

  if (page === "favorites") {
    return pageWithShell(
      "favorites",
      <FavoritesPage
        products={allProducts}
        favorites={favorites}
        onFavorite={toggleFavorite}
        onProduct={openProduct}
        onBrowse={() => go("home")}
      />,
    );
  }

  if (page === "admin" && user?.role === "admin") {
    return (
      <AdminDashboardPage
        user={user}
        onBack={() => go("home")}
        onLogout={logout}
        onProductsChanged={() => loadProducts(search)}
      />
    );
  }

  if (page === "profile") {
    return pageWithShell(
      "profile",
      <ProfilePage
        user={user || demoUser}
        savedOrders={orders}
        products={allProducts}
        onSave={(nextUser) => setUser(nextUser)}
        onLogout={logout}
        onChat={() => go("chat")}
        onAdmin={() => go("admin")}
      />,
    );
  }

  return pageWithShell(
    "home",
    <>
      <HomeStorePage
        products={homeProducts}
        favorites={favorites}
        onFavorite={toggleFavorite}
        onProduct={openProduct}
        onLoadMore={() => setVisible((v) => v + 6)}
        canLoadMore={homeProducts.length < filteredProducts.length}
        onBrand={(brand) => setSearch(brand)}
        isLoading={productsLoading}
        userId={user?.id}
      />
      {orderDone ? (
        <div className="fixed inset-x-0 top-8 z-50 mx-auto w-fit rounded-full bg-[#16aa78] px-6 py-3 font-bold text-white shadow">
          Order placed successfully
        </div>
      ) : null}
    </>,
  );
}

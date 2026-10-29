import { useLayoutEffect } from "react";
import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import HomeLive from "./pages/HomeLive";
import CategoryLive from "./pages/CategoryLive";
import ProductLive from "./pages/ProductLive";
import CartLive from "./pages/CartLive";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import { AccountHome, ForgotPassword, Login, OrderDetail, Orders, Profile, Register, ResetPassword } from "./pages/Account";
import Addresses from "./pages/Addresses";
import AuthCallback from "./pages/AuthCallback";

function App() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  if (new URLSearchParams(window.location.search).has("auth_callback")) return <AuthCallback />;

  return (
    <Routes>
      <Route path="/" element={<HomeLive />} />
      <Route path="/category" element={<CategoryLive />} />
      <Route path="/product/:slug" element={<ProductLive />} />
      <Route path="/product" element={<CategoryLive />} />
      <Route path="/cart" element={<CartLive />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account" element={<AccountHome />} />
      <Route path="/account/profile" element={<Profile />} />
      <Route path="/account/addresses" element={<Addresses />} />
      <Route path="/account/orders" element={<Orders />} />
      <Route path="/account/orders/:id" element={<OrderDetail />} />
    </Routes>
  );
}

export default App;

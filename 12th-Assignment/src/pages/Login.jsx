import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { adminApi, isBackendConfigured } from "../lib/supabase";
import { useAdminAuth } from "../context/AdminAuth";

function Login() {
  const { profile, login } = useAdminAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (profile) return <Navigate to={location.state?.from?.pathname || "/"} replace />;

  async function submit(event) {
    event.preventDefault(); setMessage(""); setBusy(true);
    try { await login(email, password); } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  async function recover() {
    if (!email) { setMessage("Enter your email first to receive a recovery link."); return; }
    try { await adminApi.resetPassword(email); setMessage("If the account exists, a recovery email has been sent."); } catch (error) { setMessage(error.message); }
  }
  return <main className="login-page"><section className="login-card"><span className="brand-logo"><span /></span><h1>BERRY Admin</h1><p>Sign in to manage your store securely.</p>{!isBackendConfigured && <div className="auth-message error">Backend configuration is required. Add the public Supabase URL and anon key.</div>}<form onSubmit={submit} className="product-form"><label className="full-field"><span>Email</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="full-field"><span>Password</span><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{message && <p className="auth-message">{message}</p>}<button className="primary-button full-field" disabled={busy || !isBackendConfigured}>{busy ? "Signing in…" : "Sign in"}</button></form><button type="button" className="login-recover" onClick={recover}>Forgot your password?</button></section></main>;
}
export default Login;

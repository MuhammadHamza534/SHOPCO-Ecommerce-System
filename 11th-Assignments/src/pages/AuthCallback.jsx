/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { storeApi } from "../lib/supabase";

export default function AuthCallback() {
  const [complete, setComplete] = useState(false); const [error, setError] = useState("");
  useEffect(() => { try { const session = storeApi.consumeAuthCallback(); if (!session) setError("The confirmation link is invalid or has expired. Please request a new confirmation email."); } catch { setError("We could not complete account confirmation. Please try signing in."); } finally { window.history.replaceState({}, document.title, `${window.location.pathname}#/account`); setComplete(true); } }, []);
  if (complete && !error) return <Navigate to="/account" replace />;
  return <main className="auth-page"><section className="auth-page__main"><div className="auth-card"><p>SHOP.CO account</p><h1>{error ? "Confirmation needed" : "Confirming your account"}</h1><p className="auth-card__intro">{error || "Your verified session is being prepared…"}</p></div></section></main>;
}

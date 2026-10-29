/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { adminApi, clearSession, isBackendConfigured } from "../lib/supabase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBackendConfigured) { setLoading(false); return; }
    adminApi.me().then((value) => setProfile(value)).catch(() => clearSession()).finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    await adminApi.signIn(email, password);
    const nextProfile = await adminApi.me();
    if (!nextProfile || !["super_admin", "admin", "staff"].includes(nextProfile.role)) {
      clearSession();
      throw new Error("This account is not authorized to access the administration area.");
    }
    setProfile(nextProfile);
  }

  async function logout() { await adminApi.signOut(); setProfile(null); }
  return <AdminAuthContext.Provider value={{ profile, loading, login, logout }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return value;
}

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getSession, storeApi } from "../lib/supabase";

const blank = { label: "Home", recipient_name: "", phone: "", address_line1: "", city: "", country: "Pakistan", is_default: false };
export default function Addresses() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(blank); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; storeApi.addresses().then((rows) => { if (active) setItems(rows || []); }).catch((error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  if (!getSession()) return <Navigate to="/login" replace />;
  async function save(event) { event.preventDefault(); try { const saved = await storeApi.saveAddress({ ...form, user_id: getSession().user.id }); setItems((current) => [Array.isArray(saved) ? saved[0] : saved, ...current]); setForm(blank); setMessage("Address saved."); } catch (error) { setMessage(error.message); } }
  async function makeDefault(id) { await storeApi.setDefaultAddress(id); setItems((current) => current.map((item) => ({ ...item, is_default: item.id === id }))); }
  async function remove(id) { await storeApi.removeAddress(id); setItems((current) => current.filter((item) => item.id !== id)); }
  return <main className="auth-page"><Header/><section className="auth-page__main"><div className="auth-card auth-card--wide"><p>SHOP.CO account</p><h1>Saved addresses</h1><form className="account-form" onSubmit={save}>{Object.keys(blank).filter((key) => key !== "is_default").map((key) => <label key={key}>{key.replaceAll("_", " ")}<input required={key !== "phone"} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })}/></label>)}<button className="store-primary-button">Save address</button></form>{message && <p className="form-feedback">{message}</p>}{loading ? <p>Loading addresses…</p> : items.map((address) => <article className="account-address" key={address.id}><strong>{address.label}{address.is_default ? " · Default" : ""}</strong><span>{address.recipient_name}<br/>{address.address_line1}, {address.city}</span><div><button type="button" onClick={() => makeDefault(address.id)}>Make default</button><button type="button" onClick={() => remove(address.id)}>Delete</button></div></article>)}</div></section><Footer/></main>;
}

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Mail, Phone, Trash2, UsersRound, X } from "lucide-react";
import { adminApi } from "../lib/supabase";
import { useAdminAuth } from "../context/AdminAuth";

export default function UsersManagement() {
  const { profile } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [term, setTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const isSuperAdmin = profile?.role === "super_admin";

  useEffect(() => {
    let active = true;
    adminApi.customers().then((data) => { if (active) setUsers(Array.isArray(data) ? data : []); }).catch((loadError) => { if (active) setError(loadError.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => users.filter((user) => `${user.full_name} ${user.email} ${user.phone}`.toLowerCase().includes(term.toLowerCase())), [users, term]);
  async function deleteCustomer() {
    if (!deleteTarget || !isSuperAdmin) return;
    setDeleting(true); setError("");
    try { await adminApi.deleteCustomer(deleteTarget.id); setUsers((current) => current.filter((user) => user.id !== deleteTarget.id)); setDeleteTarget(null); window.dispatchEvent(new Event("berry-data-changed")); }
    catch (deleteError) { setError(deleteError.message || "The customer could not be deleted."); }
    finally { setDeleting(false); }
  }

  return <div className="page users-page">
    <div className="page-heading"><div><h1>Customers</h1><p>Registered customer profiles and purchase activity.</p></div><div className="page-count"><UsersRound size={18}/>{filtered.length} Customers</div></div>
    <input className="table-filter" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search name, email, or phone"/>
    {error && <p className="auth-message error">{error}</p>}
    <section className="data-panel desktop-data-table"><div className="table-scroll"><table className="dashboard-table users-table"><thead><tr><th>User</th><th>Contact</th><th>Orders</th><th>Total Spent</th><th>Joined</th>{isSuperAdmin && <th>Actions</th>}</tr></thead><tbody>
      {loading ? <tr><td colSpan={isSuperAdmin ? 6 : 5}>Loading customers…</td></tr> : filtered.map((user) => <tr key={user.id}><td><div className="customer-cell"><span className="customer-avatar">{user.full_name?.slice(0, 2).toUpperCase()}</span><div><strong>{user.full_name || "Customer"}</strong><small>{user.id.slice(0, 8)}</small></div></div></td><td><div className="user-contact"><span><Mail size={14}/>{user.email}</span><small><Phone size={13}/>{user.phone || "—"}</small></div></td><td><strong className="user-orders">{user.orders}</strong></td><td><strong className="user-spent">${Number(user.spent).toFixed(2)}</strong></td><td>{new Date(user.created_at).toLocaleDateString()}</td>{isSuperAdmin && <td><button type="button" className="table-danger-action" onClick={() => setDeleteTarget(user)}><Trash2 size={14}/>Delete</button></td>}</tr>)}
      {!loading && !filtered.length && <tr><td colSpan={isSuperAdmin ? 6 : 5} className="table-not-found"><UsersRound size={38}/><strong>No customers found</strong><span>Registered customers appear here.</span></td></tr>}
    </tbody></table></div></section>
    {deleteTarget && <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-customer-title"><div className="product-modal danger-modal"><div className="modal-header"><div><h2 id="delete-customer-title"><AlertTriangle size={20}/>Delete customer account?</h2><p>This action is available only to Super Admins.</p></div><button className="modal-close" type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} aria-label="Close"><X size={18}/></button></div><div className="delete-product-preview"><span className="customer-avatar">{deleteTarget.full_name?.slice(0, 2).toUpperCase()}</span><div><strong>{deleteTarget.full_name || "Customer"}</strong><small>{deleteTarget.email}</small></div></div><p className="danger-copy">This removes the customer’s Auth account and profile. Existing orders remain for financial history, with personal details anonymized. This cannot be undone.</p><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button><button type="button" className="danger-button" onClick={deleteCustomer} disabled={deleting}>{deleting ? "Deleting…" : "Delete customer"}</button></div></div></div>}
  </div>;
}

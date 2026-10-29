const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const storageKey = "berry-admin-session";
export const isBackendConfigured = Boolean(url && anonKey);

function readSession() { try { return JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { return null; } }
function persistSession(session) { localStorage.setItem(storageKey, JSON.stringify(session)); }
export function clearSession() { localStorage.removeItem(storageKey); }

export async function request(path, options = {}) {
  if (!isBackendConfigured) throw new Error("Admin backend is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  const session = readSession();
  const response = await fetch(`${url}${path}`, { ...options, headers: { apikey: anonKey, Authorization: `Bearer ${session?.access_token || anonKey}`, "Content-Type": "application/json", ...(options.headers || {}) } });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.hint || data?.error_description || "Request failed.");
  return data;
}

export const adminApi = {
  async signIn(email, password) { const session = await request("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) }); persistSession(session); return session; },
  async signOut() { try { await request("/auth/v1/logout", { method: "POST" }); } finally { clearSession(); } },
  resetPassword(email) { return request("/auth/v1/recover", { method: "POST", body: JSON.stringify({ email }) }); },
  me() { return request("/rest/v1/profiles?select=id,full_name,role,status&limit=1").then((rows) => rows[0] || null); },
  dashboard(period) { return request("/rest/v1/rpc/admin_dashboard", { method: "POST", body: JSON.stringify({ p_period: period }) }); },
  orders(search = "", status = null) { return request("/rest/v1/rpc/admin_orders", { method: "POST", body: JSON.stringify({ p_search: search || null, p_status: status, p_limit: 100, p_offset: 0 }) }); },
  updateOrder(id, status) { return request(`/rest/v1/orders?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status }) }); },
  orderDetail(id) { return request("/rest/v1/rpc/admin_order_detail", {method:"POST",body:JSON.stringify({p_order_id:id})}); },
  updateShipping(id, courier, tracking) { return request("/rest/v1/rpc/update_shipping", {method:"POST",body:JSON.stringify({p_order_id:id,p_courier:courier,p_tracking_number:tracking})}); },
  addOrderNote(id, note, visible=false) { return request("/rest/v1/rpc/add_order_note", {method:"POST",body:JSON.stringify({p_order_id:id,p_note:note,p_customer_visible:visible})}); },
  reports(from, to) { return request("/rest/v1/rpc/admin_reports", {method:"POST",body:JSON.stringify({p_from:from,p_to:to})}); },
  products() { return request("/rest/v1/products?select=id,slug,name,sku,category_id,regular_price,sale_price,stock_quantity,low_stock_threshold,status,visibility,description,category:categories(name),product_images(url,position)&order=created_at.desc"); },
  findProducts(field, value) { if (!['slug', 'sku'].includes(field)) throw new Error('Unsupported product lookup.'); return request(`/rest/v1/products?select=id&${field}=eq.${encodeURIComponent(value)}&limit=2`); },
  saveProduct(product) { const row = { ...product }; const id = row.id; delete row.id; delete row.image_url; delete row.category_name; delete row.category; delete row.product_images; const method = id ? "PATCH" : "POST"; const suffix = id ? `?id=eq.${id}` : ""; return request(`/rest/v1/products${suffix}`, { method, headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }); },
  archiveProduct(id) { return request(`/rest/v1/products?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "archived", visibility: false }) }); },
  restoreProduct(id) { return request(`/rest/v1/products?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "draft", visibility: false }) }); },
  async deleteProduct(id) {
    const result = await request("/rest/v1/rpc/admin_delete_product", { method: "POST", body: JSON.stringify({ p_product_id: id }) });
    const session = readSession();
    const cleanupErrors = [];
    for (const path of result?.storage_paths || []) {
      const response = await fetch(`${url}/storage/v1/object/product-images/${path}`, { method: "DELETE", headers: { apikey: anonKey, Authorization: `Bearer ${session?.access_token || anonKey}` } });
      if (!response.ok && response.status !== 404) cleanupErrors.push(path);
    }
    return { ...result, cleanupErrors };
  },
  categories() { return request("/rest/v1/categories?select=id,name,slug,description,is_active,display_order&order=display_order.asc"); },
  saveCategory(category) { const { id, ...row } = category; return request(`/rest/v1/categories${id ? `?id=eq.${id}` : ""}`, { method: id ? "PATCH" : "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }); },
  customers() { return request("/rest/v1/rpc/admin_customers", { method: "POST", body: "{}" }); },
  deleteCustomer(id) { return request("/rest/v1/rpc/admin_delete_customer", { method: "POST", body: JSON.stringify({ p_customer_id: id }) }); },
  deleteTestOrder(id) { return request("/rest/v1/rpc/admin_delete_test_order", { method: "POST", body: JSON.stringify({ p_order_id: id }) }); },
  coupons() { return request("/rest/v1/coupons?select=*&order=created_at.desc"); },
  saveCoupon(coupon) { const { id, ...row } = coupon; return request(`/rest/v1/coupons${id ? `?id=eq.${id}` : ""}`, { method: id ? "PATCH" : "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }); },
  newsletter(status = "") { return request(`/rest/v1/newsletter_subscribers?select=*&order=created_at.desc${status ? `&status=eq.${status}` : ""}`); },
  updateSubscriber(id, status) { return request(`/rest/v1/newsletter_subscribers?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status, unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null }) }); },
  settings() { return request("/rest/v1/store_settings?select=key,value,updated_at"); },
  saveSettings(values) { return request("/rest/v1/store_settings?on_conflict=key", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(Object.entries(values).map(([key, value]) => ({ key, value }))) }); },
  images(productId) { return request(`/rest/v1/product_images?select=*&product_id=eq.${productId}&order=position.asc`); },
  removeImage(id) { return request(`/rest/v1/product_images?id=eq.${id}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }); },
  updateImage(id, values) { return request(`/rest/v1/product_images?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(values) }); },
  async removeProductImage(image) {
    await this.removeImage(image.id);
    if (!image.storage_path) return;
    const session = readSession();
    const response = await fetch(`${url}/storage/v1/object/product-images/${image.storage_path}`, { method: "DELETE", headers: { apikey: anonKey, Authorization: `Bearer ${session?.access_token || anonKey}` } });
    if (!response.ok && response.status !== 404) { const error = await response.json().catch(() => ({})); throw new Error(error.message || "The image record was removed, but storage cleanup failed."); }
  },
  async uploadProductImage(productId, file, position = 0) {
    if (!file?.type?.startsWith("image/")) throw new Error("Select an image file.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-"); const path = `${productId}/${crypto.randomUUID()}-${safeName}`; const session = readSession();
    const response = await fetch(`${url}/storage/v1/object/product-images/${path}`, { method: "POST", headers: { apikey: anonKey, Authorization: `Bearer ${session?.access_token || anonKey}`, "Content-Type": file.type, "x-upsert": "false" }, body: file });
    if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.message || "Image upload failed."); }
    const publicUrl = `${url}/storage/v1/object/public/product-images/${path}`;
    return request("/rest/v1/product_images", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ product_id: productId, url: publicUrl, storage_path: path, position }) });
  },
  async replaceProductImage(image, file) {
    if (!file?.type?.startsWith("image/") || file.size > 5 * 1024 * 1024) throw new Error("Select a JPG, PNG, WebP, or GIF image no larger than 5 MB.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-"); const path = `${image.product_id}/${crypto.randomUUID()}-${safeName}`; const session = readSession();
    const upload = await fetch(`${url}/storage/v1/object/product-images/${path}`, { method: "POST", headers: { apikey: anonKey, Authorization: `Bearer ${session?.access_token || anonKey}`, "Content-Type": file.type, "x-upsert": "false" }, body: file });
    if (!upload.ok) { const error = await upload.json().catch(() => ({})); throw new Error(error.message || "Replacement image upload failed."); }
    const updatedRows = await this.updateImage(image.id, { url: `${url}/storage/v1/object/public/product-images/${path}`, storage_path: path });
    if (image.storage_path) { const cleanup = await fetch(`${url}/storage/v1/object/product-images/${image.storage_path}`, { method: "DELETE", headers: { apikey: anonKey, Authorization: `Bearer ${session?.access_token || anonKey}` } }); if (!cleanup.ok && cleanup.status !== 404) throw new Error("Replacement image was saved, but the old storage object could not be removed."); }
    return Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
  },
};

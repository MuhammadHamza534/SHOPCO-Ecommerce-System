const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const storageKey = "shopco-supabase-session";

export const isBackendConfigured = Boolean(url && anonKey);

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(storageKey);
}

function authRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}?auth_callback=1`;
}

async function request(path, options = {}) {
  if (!isBackendConfigured) {
    throw new Error("Store backend is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const session = getSession();
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${session?.access_token || anonKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.text();
  const data = body ? JSON.parse(body) : null;
  if (!response.ok) {
    const error = new Error(data?.message || data?.msg || data?.hint || data?.error_description || "The request could not be completed.");
    error.code = data?.error_code || data?.code || "";
    throw error;
  }
  return data;
}

export const storeApi = {
  async products(filters = {}) {
    const params = new URLSearchParams({ select: "id,slug,name,short_description,description,regular_price,sale_price,currency,stock_quantity,featured,new_arrival,best_seller,rating,category:categories(id,name,slug),product_images(url,position,alt_text),product_variants(id,size,color,stock_quantity,price_override)", status: "eq.published", visibility: "eq.true", order: "created_at.desc" });
    if (filters.search) params.set("name", `ilike.*${filters.search}*`);
    if (filters.category) params.set("category_id", `eq.${filters.category}`);
    return request(`/rest/v1/products?${params}`);
  },
  product(slug) {
    return request(`/rest/v1/products?select=id,slug,name,short_description,description,regular_price,sale_price,currency,stock_quantity,featured,new_arrival,best_seller,rating,category:categories(id,name,slug),product_images(url,position,alt_text),product_variants(id,size,color,stock_quantity,price_override)&slug=eq.${encodeURIComponent(slug)}&status=eq.published&visibility=eq.true&limit=1`).then((rows) => rows[0] || null);
  },
  categories() {
    return request("/rest/v1/categories?select=id,name,slug,description,image_url,display_order&is_active=eq.true&order=display_order.asc");
  },
  settings() { return request("/rest/v1/store_settings?select=key,value").then((rows) => Object.fromEntries(rows.map((row) => [row.key, row.value]))); },
  async subscribe(email) {
    return request("/rest/v1/newsletter_subscribers", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ email, consent_at: new Date().toISOString() }) });
  },
  async validateCoupon(code, subtotal, items) {
    return request("/rest/v1/rpc/validate_coupon", { method: "POST", body: JSON.stringify({ p_code: code, p_subtotal: subtotal, p_items: items }) });
  },
  async placeOrder(payload) {
    return request("/rest/v1/rpc/place_order", { method: "POST", body: JSON.stringify({ p_checkout: payload }) });
  },
  async signUp(email, password, fullName) {
    const result = await request("/auth/v1/signup", { method: "POST", body: JSON.stringify({ email, password, data: { full_name: fullName }, options: { emailRedirectTo: authRedirectUrl() } }) });
    if (result?.access_token) saveSession(result);
    return result;
  },
  async signIn(email, password) {
    const session = await request("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
    saveSession(session);
    try {
      const profile = await request("/rest/v1/profiles?select=id,status&limit=1").then((rows) => rows[0] || null);
      if (!profile) { const error = new Error("Your customer profile is not ready yet. Please try again shortly."); error.code = "profile_missing"; throw error; }
      if (profile.status !== "active") { const error = new Error("This customer account is currently restricted."); error.code = "account_restricted"; throw error; }
    } catch (error) {
      clearSession();
      throw error;
    }
    return session;
  },
  async signOut() {
    await request("/auth/v1/logout", { method: "POST" });
    clearSession();
  },
  recoverPassword(email) { return request("/auth/v1/recover", {method:"POST",body:JSON.stringify({email})}); },
  resendConfirmation(email) { return request("/auth/v1/resend", { method: "POST", body: JSON.stringify({ type: "signup", email, options: { emailRedirectTo: authRedirectUrl() } }) }); },
  consumeAuthCallback() {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token"); const refreshToken = hash.get("refresh_token");
    if (!accessToken || !refreshToken) return null;
    const session = { access_token: accessToken, refresh_token: refreshToken, token_type: hash.get("token_type") || "bearer", expires_in: Number(hash.get("expires_in") || 0) };
    saveSession(session); return session;
  },
  updatePassword(password) { return request("/auth/v1/user", {method:"PUT",body:JSON.stringify({password})}); },
  profile() { return request("/rest/v1/profiles?select=id,full_name,phone,status,created_at&limit=1").then((rows) => rows[0] || null); },
  updateProfile(values) { return request("/rest/v1/profiles?id=eq." + getSession().user.id, { method:"PATCH", headers:{Prefer:"return=representation"}, body:JSON.stringify(values) }).then((rows)=>rows[0]); },
  myOrders() { return request("/rest/v1/orders?select=id,order_number,created_at,total_amount,payment_method,payment_status,status,tracking_number,courier,order_items(quantity)&order=created_at.desc").then((rows) => (rows || []).map(({ order_items, ...order }) => ({ ...order, item_count: (order_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0) }))); },
  orderDetail(id) { return request("/rest/v1/rpc/customer_order_detail", { method:"POST", body:JSON.stringify({p_order_id:id}) }); },
  addresses() { return request("/rest/v1/customer_addresses?select=*&order=is_default.desc,created_at.desc"); },
  saveAddress(address) { const {id,...row}=address; return request(`/rest/v1/customer_addresses${id?`?id=eq.${id}`:""}`, {method:id?"PATCH":"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(row)}); },
  removeAddress(id) { return request(`/rest/v1/customer_addresses?id=eq.${id}`, {method:"DELETE",headers:{Prefer:"return=minimal"}}); },
  setDefaultAddress(id) { return request("/rest/v1/rpc/set_default_address", {method:"POST",body:JSON.stringify({p_address_id:id})}); },
};

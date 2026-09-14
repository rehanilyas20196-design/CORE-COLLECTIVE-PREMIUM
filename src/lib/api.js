const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://core-backend-collect.vercel.app';

function sanitizeUrls(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/^hthttps:\/\//i, 'https://');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeUrls);
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = sanitizeUrls(obj[key]);
    }
    return result;
  }
  return obj;
}

async function refreshSessionToken() {
  const { supabase } = await import('./supabase');
  if (!supabase) return '';
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data?.session?.access_token) {
      return data.session.access_token;
    }
  } catch {}
  return '';
}

async function getToken() {
  const { supabase } = await import('./supabase');
  if (!supabase) return '';

  const { data: { session } } = await supabase.auth.getSession();

  // If the session is missing or its access token is expired (or about to
  // expire), force a refresh instead of returning a stale token that the
  // backend will reject with 401.
  const expiresAtMs = (session?.expires_at || 0) * 1000;
  const isExpired = !session?.access_token || Date.now() >= expiresAtMs - 30_000;
  if (!session?.access_token || isExpired) {
    return refreshSessionToken();
  }

  return session.access_token;
}

async function throwErrorResponse(res) {
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    const seconds = retryAfter ? parseInt(retryAfter) : 60;
    const minutes = Math.ceil(seconds / 60);
    throw new Error(`Too many requests. Please try again after ${minutes} minute${minutes > 1 ? 's' : ''}.`);
  }
  const body = await res.json().catch(() => ({ message: res.statusText }));
  throw new Error(body.message || `Request failed: ${res.status}`);
}

async function clearLocalAuth() {
  const { supabase } = await import('./supabase');
  try {
    // Only call the server when there's an actual session to revoke; otherwise
    // supabase fires a pointless 403 to /logout and pumps noise into the console.
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.refresh_token) {
      await supabase.auth.signOut({ scope: 'local' });
    }
  } catch {}
  try {
    Object.keys(localStorage || {}).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
    Object.keys(sessionStorage || {}).forEach(k => { if (k.startsWith('sb-')) sessionStorage.removeItem(k); });
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('authExpired'));
  }
}

async function request(path, options = {}) {
  const url = `/api${path}`;
  const token = await getToken();
  const isFormData = options.body instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  Object.assign(headers, options.headers);

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let res = await fetch(url, config);

  // A single 401 may be caused by a stale/expired token (clock skew, or the
  // background auto-refresh racing with this request). Refresh the session and
  // retry once before signing the user out.
  if (res.status === 401) {
    const refreshed = await refreshSessionToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed}`;
      res = await fetch(url, { ...config, headers });
    }
    if (res.status === 401) {
      await clearLocalAuth();
    }
  }

  if (!res.ok) {
    await throwErrorResponse(res);
  }
  return sanitizeUrls(await res.json());
}

export const api = {
  auth: {
    signup: (email, password, fullName, joiningDate, phone) =>
      request('/auth/signup', { method: 'POST', body: { email, password, full_name: fullName, joiningDate, phone } }),
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: { email, password } }),
    logout: () =>
      request('/auth/logout', { method: 'POST' }),
    getSession: () =>
      request('/auth/session'),
    googleSignIn: () =>
      request('/auth/google', { method: 'POST' }),
    ensureAdmin: () =>
      request('/auth/ensure-admin', { method: 'POST' }),
    getUsers: () =>
      request('/auth/admin/users'),
  },

  products: {
    getAll: (search) =>
      request(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getOne: (id) =>
      request(`/products/${id}`),
    getCategories: () =>
      request('/products/categories'),
    getRelated: (category, productId) =>
      request(`/products/related/${encodeURIComponent(category)}/${productId}`),
    getSellerProducts: (limit = 12) =>
      request(`/products/seller?limit=${limit}`),
    getMinimal: (limit = 200) =>
      request(`/products/minimal?limit=${limit}`),
    create: (productData) =>
      request('/products', { method: 'POST', body: productData }),
    delete: (id) =>
      request(`/products/${id}`, { method: 'DELETE' }),
  },

  orders: {
    getAll: () => request('/orders'),
    getConfirmedCount: () => request('/orders/confirmed-count'),
    create: (orderData) => request('/orders', { method: 'POST', body: orderData }),
    updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
    updateTracking: (id, trackingStatus, note) => request(`/orders/${id}/tracking`, { method: 'PATCH', body: { tracking_status: trackingStatus, note } }),
    sendMessage: (id, message) => request(`/orders/${id}/message`, { method: 'POST', body: { message } }),
    delete: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  },

  reviews: {
    getByProduct: (productId) => request(`/reviews/${productId}`),
    create: (reviewData) => request('/reviews', { method: 'POST', body: reviewData }),
  },

  deals: {
    getAll: () => request('/deals'),
  },

  recommendedItems: {
    getAll: () => request('/recommended-items'),
  },

  supplierInquiries: {
    getAll: () => request('/supplier-inquiries'),
    create: (data) => request('/supplier-inquiries', { method: 'POST', body: data }),
    updateStatus: (id, status, adminNotes, supplierRef) =>
      request(`/supplier-inquiries/${id}/status`, { method: 'PATCH', body: { status, admin_notes: adminNotes, supplier_ref: supplierRef } }),
    delete: (id) => request(`/supplier-inquiries/${id}`, { method: 'DELETE' }),
  },

  upload: {
    paymentScreenshot: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const token = await getToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return request('/upload/payment-screenshot', {
        method: 'POST',
        body: formData,
        headers,
      });
    },
  },

  favorites: {
    getAll: () => request('/favorites'),
    toggle: (productId, productData) =>
      request('/favorites/toggle', { method: 'POST', body: { product_id: productId, product_data: productData } }),
    add: (productId, productData) =>
      request('/favorites/add', { method: 'POST', body: { product_id: productId, product_data: productData } }),
    remove: (productId) => request(`/favorites/${productId}`, { method: 'DELETE' }),
  },

  cart: {
    getAll: () => request('/cart'),
    add: (productId, qty = 1, productData) =>
      request('/cart/add', { method: 'POST', body: { product_id: productId, qty, product_data: productData } }),
    updateQty: (productId, qty) =>
      request('/cart/update-qty', { method: 'PATCH', body: { product_id: productId, qty } }),
    remove: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
  },

  notifications: {
    getAll: () => request('/notifications'),
    getUnreadCount: () => request('/notifications/unread-count'),
    create: (type, title, message, data) =>
      request('/notifications', { method: 'POST', body: { type, title, message, data } }),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
    delete: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
  },

  messages: {
    getAll: () => request('/messages'),
    create: (sender, message) =>
      request('/messages', { method: 'POST', body: { sender, message } }),
    clear: () => request('/messages/clear', { method: 'DELETE' }),
    remove: (id) => request(`/messages/${id}`, { method: 'DELETE' }),
  },

  buyRequests: {
    getAll: () => request('/buy-requests'),
    create: (data) => request('/buy-requests', { method: 'POST', body: data }),
    updateStatus: (id, status, adminNotes) =>
      request(`/buy-requests/${id}/status`, { method: 'PATCH', body: { status, admin_notes: adminNotes } }),
    updateTracking: (id, trackingStatus, note) =>
      request(`/buy-requests/${id}/tracking`, { method: 'PATCH', body: { tracking_status: trackingStatus, note } }),
    delete: (id) => request(`/buy-requests/${id}`, { method: 'DELETE' }),
  },

  supplierProducts: {
    getAll: () => request('/supplier-products'),
    getMine: () => request('/supplier-products/mine'),
    create: (data) => request('/supplier-products', { method: 'POST', body: data }),
    updateStatus: (id, status, adminNotes) =>
      request(`/supplier-products/${id}/status`, { method: 'PATCH', body: { status, admin_notes: adminNotes } }),
    delete: (id) => request(`/supplier-products/${id}`, { method: 'DELETE' }),
  },

  discountMessages: {
    getAll: () => request('/discount-messages'),
    create: (userEmail, userName, message) =>
      request('/discount-messages', { method: 'POST', body: { user_email: userEmail, user_name: userName, message } }),
    updateStatus: (id, status, adminReply) =>
      request(`/discount-messages/${id}/status`, { method: 'PATCH', body: { status, admin_reply: adminReply } }),
    delete: (id) => request(`/discount-messages/${id}`, { method: 'DELETE' }),
  },

  quotes: {
    create: (data) =>
      request('/quotes', { method: 'POST', body: data }),
    getAll: () => request('/quotes'),
    getOne: (id) => request(`/quotes/${id}`),
    updateStatus: (id, status, adminNote) =>
      request(`/quotes/${id}/status`, { method: 'PATCH', body: { status, admin_note: adminNote } }),
    delete: (id) => request(`/quotes/${id}`, { method: 'DELETE' }),
  },

  contactMessages: {
    create: (name, email, phone, subject, message) =>
      request('/contact-messages', { method: 'POST', body: { name, email, phone, subject, message } }),
    getAll: (status) =>
      request(`/contact-messages${status ? `?status=${status}` : ''}`),
    getOne: (id) =>
      request(`/contact-messages/${id}`),
    reply: (id, adminReply) =>
      request(`/contact-messages/${id}/reply`, { method: 'PATCH', body: { admin_reply: adminReply } }),
    delete: (id) =>
      request(`/contact-messages/${id}`, { method: 'DELETE' }),
  },
};

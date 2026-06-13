const API_BASE = '/api';

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

async function getToken() {
  const { supabase } = await import('./supabase');
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  if (!user) return '';
  const { data: { session: refreshed } } = await supabase.auth.getSession();
  return refreshed?.access_token || '';
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
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

  const res = await fetch(url, config);
  if (!res.ok) {
    if (res.status === 401) {
      const { supabase } = await import('./supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authExpired'));
        }
      }
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      const seconds = retryAfter ? parseInt(retryAfter) : 60;
      const minutes = Math.ceil(seconds / 60);
      throw new Error(`Too many requests. Please try again after ${minutes} minute${minutes > 1 ? 's' : ''}.`);
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
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
    delete: (id) =>
      request(`/products/${id}`, { method: 'DELETE' }),
  },

  orders: {
    getAll: () => request('/orders'),
    getConfirmedCount: () => request('/orders/confirmed-count'),
    create: (orderData) => request('/orders', { method: 'POST', body: orderData }),
    updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
    updateTracking: (id, trackingStatus, note) => request(`/orders/${id}/tracking`, { method: 'PATCH', body: { tracking_status: trackingStatus, note } }),
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

  contactMessages: {
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

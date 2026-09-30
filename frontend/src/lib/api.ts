const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchFromApi(endpoint: string, options: RequestInit & { tenantSlug?: string; token?: string } = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.tenantSlug) {
    headers['X-Tenant-Slug'] = options.tenantSlug;
  }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'API Request failed' }));
    throw new Error(errorBody.message || `API HTTP ${res.status}`);
  }

  return res.json();
}

// Storefront & Theme APIs
export async function getTenantTheme(tenantSlug: string) {
  return fetchFromApi('/tenant/theme', { tenantSlug });
}

export async function getTenantProducts(tenantSlug: string, category?: string, isBestseller?: boolean) {
  let query = '';
  if (category) query += `?category=${category}`;
  if (isBestseller) query += `${query ? '&' : '?'}bestseller=true`;
  return fetchFromApi(`/catalog/products${query}`, { tenantSlug });
}

export async function getProductBySlug(tenantSlug: string, slug: string) {
  return fetchFromApi(`/catalog/products/${slug}`, { tenantSlug });
}

export async function getCategories(tenantSlug: string) {
  return fetchFromApi('/catalog/categories', { tenantSlug });
}

export async function calculateCart(tenantSlug: string, items: any[], couponCode?: string) {
  return fetchFromApi('/checkout/cart/calculate', {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify({ items, couponCode }),
  });
}

export async function validateCoupon(tenantSlug: string, code: string, subtotal: number) {
  return fetchFromApi('/checkout/coupon/validate', {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify({ code, subtotal }),
  });
}

export async function initiateCheckout(tenantSlug: string, checkoutData: any) {
  return fetchFromApi('/checkout/initiate', {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify(checkoutData),
  });
}

export async function trackOrder(tenantSlug: string, orderNumber: string, phone: string) {
  return fetchFromApi(`/orders/track?orderNumber=${orderNumber}&phone=${phone}`, { tenantSlug });
}

export async function trackAnalyticsEvent(tenantSlug: string, eventType: string, payload: any) {
  return fetchFromApi('/events/track', {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify({ eventType, payload }),
  });
}

// Brand Admin APIs
export async function adminLogin(tenantSlug: string, credentials: { email: string; password: string }) {
  return fetchFromApi('/auth/staff/login', {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify(credentials),
  });
}

export async function getAdminDashboard(tenantSlug: string, token: string) {
  return fetchFromApi('/admin/dashboard', { tenantSlug, token });
}

export async function updateTenantTheme(tenantSlug: string, token: string, themeData: any) {
  return fetchFromApi('/tenant/theme', {
    method: 'PUT',
    tenantSlug,
    token,
    body: JSON.stringify(themeData),
  });
}

export async function createProduct(tenantSlug: string, token: string, productData: any) {
  return fetchFromApi('/catalog/products', {
    method: 'POST',
    tenantSlug,
    token,
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(tenantSlug: string, token: string, productId: string, productData: any) {
  return fetchFromApi(`/catalog/products/${productId}`, {
    method: 'PUT',
    tenantSlug,
    token,
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(tenantSlug: string, token: string, productId: string) {
  return fetchFromApi(`/catalog/products/${productId}`, {
    method: 'DELETE',
    tenantSlug,
    token,
  });
}

export async function addProductReview(tenantSlug: string, productId: string, review: { author: string; rating: number; title: string; comment: string; verified?: boolean }) {
  return fetchFromApi(`/catalog/products/${productId}/reviews`, {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify(review),
  });
}


export async function updateTenantBrand(token: string, tenantId: string, data: any) {
  return fetchFromApi(`/admin/tenants/${tenantId}`, {
    method: 'PUT',
    tenantSlug: 'platform',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateOrderFulfillment(tenantSlug: string, token: string, orderId: string, status: string, tracking?: any) {
  return fetchFromApi(`/orders/${orderId}/fulfillment`, {
    method: 'PUT',
    tenantSlug,
    token,
    body: JSON.stringify({ status, tracking }),
  });
}

export async function createCoupon(tenantSlug: string, token: string, couponData: any) {
  return fetchFromApi('/admin/coupons', {
    method: 'POST',
    tenantSlug,
    token,
    body: JSON.stringify(couponData),
  });
}

export async function configureWhatsApp(tenantSlug: string, token: string, config: any) {
  return fetchFromApi('/messaging/whatsapp/config', {
    method: 'POST',
    tenantSlug,
    token,
    body: JSON.stringify(config),
  });
}

export async function getWhatsAppLogs(tenantSlug: string, token: string) {
  return fetchFromApi('/messaging/whatsapp/logs', { tenantSlug, token });
}

// Razorpay Payment Verification
export async function verifyPayment(tenantSlug: string, verificationData: {
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  order_id?: string;
}) {
  return fetchFromApi('/checkout/verify-payment', {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify(verificationData),
  });
}

// Admin Orders
export async function getAdminOrders(tenantSlug: string, token: string, status?: string) {
  const query = status ? `?status=${status}` : '';
  return fetchFromApi(`/orders${query}`, { tenantSlug, token });
}

// Self-serve Lead Capture (public landing page form)
export async function captureLead(leadData: {
  brand_name: string;
  niche: string;
  email: string;
  phone: string;
  plan?: string;
}) {
  return fetchFromApi('/leads/capture', {
    method: 'POST',
    body: JSON.stringify(leadData),
  });
}

// Custom Domain Management
export async function addCustomDomain(tenantSlug: string, token: string, domain: string) {
  return fetchFromApi('/tenant/domains', {
    method: 'POST',
    tenantSlug,
    token,
    body: JSON.stringify({ domain }),
  });
}

export async function verifyCustomDomain(tenantSlug: string, token: string, domainId: string) {
  return fetchFromApi(`/tenant/domains/${domainId}/verify`, {
    method: 'POST',
    tenantSlug,
    token,
  });
}

// ----------------------------------------------------
// Shopper / Customer Account APIs
// ----------------------------------------------------
export async function customerLogin(tenantSlug: string, data: { phone: string; email?: string; name?: string }) {
  return fetchFromApi('/customer/auth/login', {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify(data),
  });
}

export async function getCustomerProfile(tenantSlug: string, token: string) {
  return fetchFromApi('/customer/profile', { tenantSlug, token });
}

export async function updateCustomerProfile(tenantSlug: string, token: string, data: { name?: string; email?: string }) {
  return fetchFromApi('/customer/profile', {
    method: 'PUT',
    tenantSlug,
    token,
    body: JSON.stringify(data),
  });
}

export async function getCustomerOrders(tenantSlug: string, token: string) {
  return fetchFromApi('/customer/orders', { tenantSlug, token });
}

export async function addCustomerAddress(tenantSlug: string, token: string, address: any) {
  return fetchFromApi('/customer/addresses', {
    method: 'POST',
    tenantSlug,
    token,
    body: JSON.stringify(address),
  });
}

export async function deleteCustomerAddress(tenantSlug: string, token: string, addressId: string) {
  return fetchFromApi(`/customer/addresses/${addressId}`, {
    method: 'DELETE',
    tenantSlug,
    token,
  });
}

// ----------------------------------------------------
// Shiprocket & Shipping Logistics APIs
// ----------------------------------------------------
export async function getShippingConfig(tenantSlug: string, token: string) {
  return fetchFromApi('/shipping/config', { tenantSlug, token });
}

export async function saveShippingConfig(tenantSlug: string, token: string, config: any) {
  return fetchFromApi('/shipping/config', {
    method: 'POST',
    tenantSlug,
    token,
    body: JSON.stringify(config),
  });
}

export async function calculateShippingRates(tenantSlug: string, data: {
  pickupPincode?: string;
  deliveryPincode: string;
  weightKg?: number;
  isCod?: boolean;
}) {
  return fetchFromApi('/shipping/rates', {
    method: 'POST',
    tenantSlug,
    body: JSON.stringify(data),
  });
}

export async function dispatchOrderShiprocket(tenantSlug: string, token: string, data: {
  orderId: string;
  courierName?: string;
  length?: number;
  breadth?: number;
  height?: number;
  weightKg?: number;
}) {
  return fetchFromApi('/shipping/dispatch', {
    method: 'POST',
    tenantSlug,
    token,
    body: JSON.stringify(data),
  });
}

export async function trackShipmentAwb(tenantSlug: string, awb: string) {
  return fetchFromApi(`/shipping/track/${awb}`, { tenantSlug });
}


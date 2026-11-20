import { api } from "@/lib/axios";

const unwrap = (res) => ({ items: res.data.data, meta: res.data.meta });

export const fetchMyOrders = async (params) =>
  unwrap(await api.get("/api/orders/my", { params }));

export const fetchOrder = async (id) => (await api.get(`/api/orders/${id}`)).data.data;

export const cancelOrder = async (id) =>
  (await api.patch(`/api/orders/${id}/cancel`)).data.data;

export const fetchDeliveryConfig = async () =>
  (await api.get("/api/orders/config")).data.data;

// { items: [{productId, quantity}], address, phone } -> { clientSecret, amount, orderIds }
export const createPaymentIntent = async (body) =>
  (await api.post("/api/payments/create-intent", body)).data.data;

export const confirmPayment = async (paymentIntentId) =>
  (await api.post("/api/payments/confirm", { paymentIntentId })).data.data;

export const fetchPayment = async (id) => (await api.get(`/api/payments/${id}`)).data.data;

export const fetchMyPayments = async (params) =>
  unwrap(await api.get("/api/payments/my", { params }));
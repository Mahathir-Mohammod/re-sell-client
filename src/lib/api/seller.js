import { api } from "@/lib/axios";

const unwrap = (res) => ({ items: res.data.data, meta: res.data.meta });
const data = (res) => res.data.data;

export const fetchSellerOrders = async (params) =>
  unwrap(await api.get("/api/seller/orders", { params }));

export const fetchSellerOrder = async (id) => data(await api.get(`/api/seller/orders/${id}`));

// The server owns the transition map; an illegal move returns 400 with the reason.
export const updateSellerOrderStatus = async (id, status) =>
  data(await api.patch(`/api/seller/orders/${id}/status`, { status }));

export const fetchSellerStats = async () => data(await api.get("/api/seller/stats"));

export const fetchSellerAnalytics = async () => data(await api.get("/api/seller/analytics"));
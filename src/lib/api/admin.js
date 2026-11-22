import { api } from "@/lib/axios";

// unwraps { success, data, meta } so callers deal with plain data
const unwrap = (res) => ({ items: res.data.data, meta: res.data.meta });
const data = (res) => res.data.data;

export const fetchAdminStats = async () => data(await api.get("/api/admin/stats"));
export const fetchAdminAnalytics = async () => data(await api.get("/api/admin/analytics"));

// products / moderation
export const fetchAdminProducts = async (params) =>
  unwrap(await api.get("/api/admin/products", { params }));

export const moderateProduct = async (id, body) =>
  data(await api.patch(`/api/admin/products/${id}`, body));

export const deleteAdminProduct = async (id) => data(await api.delete(`/api/admin/products/${id}`));

// users
export const fetchAdminUsers = async (params) =>
  unwrap(await api.get("/api/admin/users", { params }));

export const updateAdminUser = async (id, body) => data(await api.patch(`/api/admin/users/${id}`, body));

export const deleteAdminUser = async (id) => data(await api.delete(`/api/admin/users/${id}`));

// orders
export const fetchAdminOrders = async (params) =>
  unwrap(await api.get("/api/admin/orders", { params }));

export const updateAdminOrderStatus = async (id, status) =>
  data(await api.patch(`/api/admin/orders/${id}`, { status }));

// payments — the summary rides along in meta
export const fetchAdminPayments = async (params) =>
  unwrap(await api.get("/api/admin/payments", { params }));
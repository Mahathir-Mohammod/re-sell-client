import { api } from "@/lib/axios";

const unwrap = (res) => ({ items: res.data.data, meta: res.data.meta });
const data = (res) => res.data.data;

// items are products with an extra `wishedAt`
export const fetchWishlist = async (params) =>
  unwrap(await api.get("/api/wishlist", { params }));

export const addToWishlist = async (productId) =>
  data(await api.post("/api/wishlist", { productId }));

export const removeFromWishlist = async (productId) =>
  data(await api.delete(`/api/wishlist/${productId}`));

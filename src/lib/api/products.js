import { api } from "@/lib/axios";
import { PAGE_SIZE } from "@/lib/constants";

// unwraps { success, data, meta } so callers deal with plain data
const unwrap = (res) => ({ items: res.data.data, meta: res.data.meta });

export const FILTER_KEYS = ["search", "category", "condition", "minPrice", "maxPrice", "sort"];

// One normaliser for both sides: URLSearchParams on the client, plain object
// from `searchParams` on the server — so the query keys always match.
export function productQuery(params) {
  const get = (key) =>
    typeof params?.get === "function" ? params.get(key) : params?.[key];

  const query = { page: Number(get("page")) || 1, limit: PAGE_SIZE };
  for (const key of FILTER_KEYS) {
    const value = get(key);
    if (value) query[key] = String(value);
  }
  return query;
}

export const fetchProducts = async (params) =>
  unwrap(await api.get("/api/products", { params }));

export const fetchProduct = async (id) =>
  (await api.get(`/api/products/${id}`)).data.data;

export const fetchFeatured = async (limit = 8) =>
  (await api.get("/api/products/featured", { params: { limit } })).data.data;

export const fetchCategories = async () =>
  (await api.get("/api/categories")).data.data;
import { api } from "@/lib/axios";

const data = (res) => res.data.data;

export const fetchMarketplaceStats = async () => data(await api.get("/api/stats/marketplace"));
export const fetchTopSellers = async (limit = 6) =>
  data(await api.get("/api/stats/sellers/top", { params: { limit } }));

// public — no token needed
export async function fetchPublicSeller(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/sellers/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Seller API responded ${res.status}`);
  return (await res.json()).data;
}

export async function fetchProductReviews(productId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${encodeURIComponent(productId)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return (await res.json()).data;
}

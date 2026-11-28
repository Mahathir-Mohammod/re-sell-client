import { api } from "@/lib/axios";

const unwrap = (res) => ({ items: res.data.data, meta: res.data.meta });
const data = (res) => res.data.data;

export const createReview = async (body) => data(await api.post("/api/reviews", body));

export const fetchReviewableItems = async () => data(await api.get("/api/reviews/reviewable"));

export const fetchMyReviews = async (params) => unwrap(await api.get("/api/reviews/mine", { params }));

export const updateMe = async (body) => data(await api.patch("/api/users/me", body));

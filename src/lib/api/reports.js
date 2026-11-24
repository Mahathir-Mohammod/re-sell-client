import { api } from "@/lib/axios";

const unwrap = (res) => ({ items: res.data.data, meta: res.data.meta });
const data = (res) => res.data.data;

export const REPORT_REASONS = [
  { value: "prohibited", label: "Prohibited or illegal item" },
  { value: "counterfeit", label: "Counterfeit or fake" },
  { value: "misleading", label: "Misleading description or photos" },
  { value: "wrong-category", label: "Wrong category" },
  { value: "other", label: "Something else" },
];

export const createReport = async (body) => data(await api.post("/api/reports", body));

export const fetchReports = async (params) => unwrap(await api.get("/api/admin/reports", { params }));

export const resolveReport = async (id, status) =>
  data(await api.patch(`/api/admin/reports/${id}`, { status }));

export const setSellerVerified = async (id, verified) =>
  data(await api.patch(`/api/admin/sellers/${id}/verify`, { verified }));

import axios from "axios";

// AuthProvider registers the JWT getter, so this module stays framework-free and
// every request automatically carries a fresh token.
let getToken = () => null;

export function setTokenGetter(fn) {
  getToken = fn;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
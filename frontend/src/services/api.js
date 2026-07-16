import axios from "axios";

// In local dev, "/api" is proxied to http://localhost:5000 by vite.config.js.
// In production (deployed to Vercel), the frontend and backend live on different domains,
// so set VITE_API_URL in Vercel's project settings to your backend's full URL, e.g.
// https://your-backend.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Auth
export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const googleAuthRequest = (credential) => api.post("/auth/google", { credential });
export const logoutRequest = () => api.post("/auth/logout");
export const profileRequest = () => api.get("/auth/profile");
export const updateProfileRequest = (data) => api.put("/auth/profile", data);

// Expenses
export const listExpensesRequest = (params) => api.get("/expenses", { params });
export const createExpenseRequest = (data) => api.post("/expenses", data);
export const updateExpenseRequest = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpenseRequest = (id) => api.delete(`/expenses/${id}`);
export const exportExpensesUrl = (params) => {
  const query = new URLSearchParams(params).toString();
  return `${baseURL}/expenses/export${query ? `?${query}` : ""}`;
};

// Dashboard
export const dashboardRequest = () => api.get("/dashboard");

export default api;

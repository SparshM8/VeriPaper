import axios from "axios";

const configuredBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
const fallbackBase = import.meta.env.DEV ? "http://localhost:8000/api" : "/api";

const api = axios.create({
  baseURL: configuredBase || fallbackBase,
});

export async function analyzePaper(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

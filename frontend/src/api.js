import axios from "axios";

const api = axios.create({
  baseURL: "https://veripaper.onrender.com/api",
});

export async function analyzePaper(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

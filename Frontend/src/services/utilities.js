import axios from "axios";
import { config } from "./config";

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getHealthStatus = async () => {
  try {
    const response = await api.get("/api/v1/health");
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Health check failed";
    return { data: null, error: message };
  }
};

export const searchAll = async (query) => {
  try {
    const response = await api.get("/api/v1/search", {
      params: { q: query },
    });
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Search failed";
    return { data: null, error: message };
  }
};

export const exportData = async (format = "json") => {
  try {
    const response = await api.get(`/api/v1/export?format=${format}`, {
      responseType: "blob",
    });
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Export failed";
    return { data: null, error: message };
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/v1/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Upload failed";
    return { data: null, error: message };
  }
};
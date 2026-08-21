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

export const getLearningPaths = async () => {
  try {
    const response = await api.get("/api/v1/learning/paths");
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to load learning paths";
    return { data: null, error: message };
  }
};

export const getLearningPath = async (pathId) => {
  try {
    const response = await api.get(`/api/v1/learning/paths/${pathId}`);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to load learning path";
    return { data: null, error: message };
  }
};

export const createLearningPath = async (path) => {
  try {
    const response = await api.post("/api/v1/learning/paths", path);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to create learning path";
    return { data: null, error: message };
  }
};

export const updateProgress = async (pathId, progress) => {
  try {
    const response = await api.put(`/api/v1/learning/paths/${pathId}/progress`, progress);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to update progress";
    return { data: null, error: message };
  }
};

export const deleteLearningPath = async (pathId) => {
  try {
    const response = await api.delete(`/api/v1/learning/paths/${pathId}`);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to delete learning path";
    return { data: null, error: message };
  }
};
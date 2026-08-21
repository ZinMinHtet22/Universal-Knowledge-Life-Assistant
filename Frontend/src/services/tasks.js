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

export const getTasks = async () => {
  try {
    const response = await api.get("/api/v1/tasks");
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to load tasks";
    return { data: null, error: message };
  }
};

export const createTask = async (task) => {
  try {
    const response = await api.post("/api/v1/tasks", task);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to create task";
    return { data: null, error: message };
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    const response = await api.put(`/api/v1/tasks/${taskId}`, updates);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to update task";
    return { data: null, error: message };
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/api/v1/tasks/${taskId}`);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to delete task";
    return { data: null, error: message };
  }
};
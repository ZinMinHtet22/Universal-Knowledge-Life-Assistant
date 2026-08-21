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

export const getConversations = async () => {
  try {
    const response = await api.get("/api/v1/chat/conversations");
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to load conversations";
    return { data: null, error: message };
  }
};

export const getConversation = async (conversationId) => {
  try {
    const response = await api.get(`/api/v1/chat/conversations/${conversationId}`);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to load conversation";
    return { data: null, error: message };
  }
};

export const createConversation = async (title = "New conversation") => {
  try {
    const response = await api.post("/api/v1/chat/conversations", { title });
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to create conversation";
    return { data: null, error: message };
  }
};

export const sendMessage = async (conversationId, content) => {
  try {
    const response = await api.post(`/api/v1/chat/conversations/${conversationId}/messages`, {
      content,
    });
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to send message";
    return { data: null, error: message };
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const response = await api.delete(`/api/v1/chat/conversations/${conversationId}`);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to delete conversation";
    return { data: null, error: message };
  }
};
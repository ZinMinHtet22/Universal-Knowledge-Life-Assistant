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

export const getNotes = async () => {
  try {
    const response = await api.get("/api/v1/notes");
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to load notes";
    return { data: null, error: message };
  }
};

export const getNote = async (noteId) => {
  try {
    const response = await api.get(`/api/v1/notes/${noteId}`);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to load note";
    return { data: null, error: message };
  }
};

export const createNote = async (note) => {
  try {
    const response = await api.post("/api/v1/notes", note);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to create note";
    return { data: null, error: message };
  }
};

export const updateNote = async (noteId, updates) => {
  try {
    const response = await api.put(`/api/v1/notes/${noteId}`, updates);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to update note";
    return { data: null, error: message };
  }
};

export const deleteNote = async (noteId) => {
  try {
    const response = await api.delete(`/api/v1/notes/${noteId}`);
    return { data: response.data, error: null };
  } catch (error) {
    const message = error.response?.data?.detail || error.message || "Failed to delete note";
    return { data: null, error: message };
  }
};
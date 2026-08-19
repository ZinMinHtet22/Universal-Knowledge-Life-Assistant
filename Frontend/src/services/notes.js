import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:8000/api/notes';

const getAuthHeaders = () => {
  return { headers: { Authorization: `Bearer ${getToken()}` } };
};

export const getNotes = async () => {
  const response = await axios.get(`${API_URL}/`, getAuthHeaders());
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await axios.post(`${API_URL}/`, noteData, getAuthHeaders());
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await axios.put(`${API_URL}/${id}`, noteData, getAuthHeaders());
  return response.data;
};

export const deleteNote = async (id) => {
  await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};

export const summarizeNote = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/summarize`, {}, getAuthHeaders());
  return response.data;
};

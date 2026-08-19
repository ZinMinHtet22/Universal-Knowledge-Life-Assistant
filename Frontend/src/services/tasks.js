import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:8000/api/tasks';

const getAuthHeaders = () => {
  return { headers: { Authorization: `Bearer ${getToken()}` } };
};

export const getTasks = async () => {
  const response = await axios.get(`${API_URL}/`, getAuthHeaders());
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(`${API_URL}/`, taskData, getAuthHeaders());
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axios.put(`${API_URL}/${id}`, taskData, getAuthHeaders());
  return response.data;
};

export const deleteTask = async (id) => {
  await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};

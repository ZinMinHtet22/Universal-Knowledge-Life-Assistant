import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:8000/api/learning';

const getAuthHeaders = () => {
  return { headers: { Authorization: `Bearer ${getToken()}` } };
};

export const getTopics = async () => {
  const response = await axios.get(`${API_URL}/topics`, getAuthHeaders());
  return response.data;
};

export const createTopic = async (topic_name, difficulty) => {
  const response = await axios.post(`${API_URL}/topics`, { topic_name, difficulty }, getAuthHeaders());
  return response.data;
};

export const getFlashcards = async (topicId) => {
  const response = await axios.get(`${API_URL}/topics/${topicId}/flashcards`, getAuthHeaders());
  return response.data;
};

export const getQuizzes = async (topicId) => {
  const response = await axios.get(`${API_URL}/topics/${topicId}/quizzes`, getAuthHeaders());
  return response.data;
};

export const deleteTopic = async (topicId) => {
  await axios.delete(`${API_URL}/topics/${topicId}`, getAuthHeaders());
};

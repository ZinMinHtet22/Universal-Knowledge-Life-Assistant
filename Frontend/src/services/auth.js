import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

// FIXME: For MVP we use localStorage. Migrate to HTTP-only cookies before production.
export const setToken = (token) => {
  localStorage.setItem('ukla_token', token);
};

export const getToken = () => {
  return localStorage.getItem('ukla_token');
};

export const removeToken = () => {
  localStorage.removeItem('ukla_token');
};

export const register = async (email, password, full_name, preferred_language) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    full_name,
    preferred_language
  });
  return response.data;
};

export const login = async (username, password) => {
  // OAuth2PasswordRequestForm expects form data
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await axios.post(`${API_URL}/login`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  if (response.data.access_token) {
    setToken(response.data.access_token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    removeToken();
    throw error;
  }
};

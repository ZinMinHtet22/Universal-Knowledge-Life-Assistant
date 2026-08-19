import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:8000/api/utilities';

const getAuthHeaders = () => {
  return { headers: { Authorization: `Bearer ${getToken()}` } };
};

export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  const response = await axios.get(`${API_URL}/currency`, {
    ...getAuthHeaders(),
    params: {
      amount,
      from_currency: fromCurrency,
      to_currency: toCurrency
    }
  });
  return response.data;
};

export const convertUnit = async (amount, category, fromUnit, toUnit) => {
  const response = await axios.get(`${API_URL}/unit`, {
    ...getAuthHeaders(),
    params: {
      amount,
      category,
      from_unit: fromUnit,
      to_unit: toUnit
    }
  });
  return response.data;
};

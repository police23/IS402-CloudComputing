import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const createMomoPayment = async (order) => {
  return axios.post(`${API_BASE}/payment/momo`, order);
};

export const createZaloPayPayment = async (order) => {
  return axios.post(`${API_BASE}/payment/zalopay`, order);
};
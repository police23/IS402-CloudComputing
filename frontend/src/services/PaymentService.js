import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const createMomoPayment = async (order) => {
  return axios.post(`${API_BASE}/payment/momo`, order);
};

export const createZaloPayPayment = async (order) => {
  return axios.post(`${API_BASE}/payment/zalopay`, order);
};
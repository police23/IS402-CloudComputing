import axios from 'axios';

export const createMomoPayment = async (order) => {
  return axios.post('http://localhost:5000/api/payment/momo', order);
};

export const createZaloPayPayment = async (order) => {
  return axios.post('http://localhost:5000/api/payment/zalopay', order);
};
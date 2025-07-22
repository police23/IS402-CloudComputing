
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ORDER_API_URL = `${API_BASE_URL}/orders`;

// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserOrders = async () => {
  const response = await axios.get(ORDER_API_URL, { headers: getAuthHeader() });
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axios.get(`${ORDER_API_URL}/${orderId}`, { headers: getAuthHeader() });
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await axios.patch(`${ORDER_API_URL}/${orderId}/cancel`, {}, { headers: getAuthHeader() });
  return response.data;
};

export const getOrderStatus = async (orderId) => {
  const response = await axios.get(`${ORDER_API_URL}/${orderId}/status`, { headers: getAuthHeader() });
  return response.data;
};

// Sử dụng hàm mới getOrdersByStatusAndUser cho user
export const getProcessingOrders = async () => {
  const response = await axios.get(`${ORDER_API_URL}/processing`, { headers: getAuthHeader() });
  return response.data;
};

// Sử dụng hàm mới getAllOrdersByStatus cho admin
export const getConfirmedOrders = async () => {
  const response = await axios.get(`${ORDER_API_URL}/confirmed/all`, { headers: getAuthHeader() });
  return response.data;
};

export const getDeliveredOrders = async () => {
  const response = await axios.get(`${ORDER_API_URL}/delivered`, { headers: getAuthHeader() });
  return response.data;
};

export const getCancelledOrders = async () => {
  const response = await axios.get(`${ORDER_API_URL}/cancelled`, { headers: getAuthHeader() });
  return response.data;
};

// Sử dụng hàm mới getAllOrdersByStatus cho admin
export const getAllProcessingOrders = async () => {
  const response = await axios.get(`${ORDER_API_URL}/all`, { headers: getAuthHeader() });
  return response.data;
};

export const confirmOrder = async (orderId) => {
  const response = await axios.patch(`${ORDER_API_URL}/${orderId}/confirm`, {}, { headers: getAuthHeader() });
  return response.data;
};

export const completeOrder = async (orderId) => {
  const response = await axios.patch(`${ORDER_API_URL}/${orderId}/complete`, {}, { headers: getAuthHeader() });
  return response.data;
};

export const assignOrderToShipper = async (orderId, shipper_id) => {
  console.log('[DEBUG][orderService] assignOrderToShipper', { orderId, shipper_id });
  const response = await axios.post(
    `${ORDER_API_URL}/${orderId}/assign-shipper`,
    { shipper_id },
    { headers: getAuthHeader() }
  );
  console.log('[DEBUG][orderService] assignOrderToShipper response', response);
  return response.data;
};

export const getDeliveringOrdersByShipperID = async () => {
  const response = await axios.get(`${ORDER_API_URL}/delivering/shipper`, { headers: getAuthHeader() });
  return response.data;
};

export const getDeliveringOrdersByUserID = async () => {
  const response = await axios.get(`${ORDER_API_URL}/delivering`, { headers: getAuthHeader() });
  return response.data;
};

export const getOrderAssignment = async (orderId) => {
  const response = await axios.get(
    `${ORDER_API_URL}/${orderId}/assignment`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const unassignOrder = async (orderId) => {
  const response = await axios.delete(
    `${ORDER_API_URL}/${orderId}/unassign-shipper`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Sử dụng hàm mới getAllOrdersByStatus cho admin
export const getAllDeliveringOrders = async () => {
  const response = await axios.get(`${ORDER_API_URL}/delivering/all`, { headers: getAuthHeader() });
  return response.data;
};

// Sử dụng hàm mới getAllOrdersByStatus cho admin
export const getAllDeliveredOrders = async () => {
  const response = await axios.get(`${ORDER_API_URL}/delivered/all`, { headers: getAuthHeader() });
  return response.data;
};

export const getDeliveredOrdersByShipperID = async () => {
  const response = await axios.get(`${ORDER_API_URL}/delivered/shipper`, { headers: getAuthHeader() });
  return response.data;
};

export const getDeliveredOrdersByUserID = async () => {
  const response = await axios.get(`${ORDER_API_URL}/delivered`, { headers: getAuthHeader() });
  return response.data;
};

export const getCancelledOrdersByUserID = async () => {
  const response = await axios.get(`${ORDER_API_URL}/cancelled`, { headers: getAuthHeader() });
  return response.data;
};

export const getConfirmedOrdersByUserID = async () => {
  const response = await axios.get(`${ORDER_API_URL}/confirmed/all`, { headers: getAuthHeader() });
  return response.data;
};

export const getProcessingOrdersByUserID = async () => {
  const response = await axios.get(`${ORDER_API_URL}/processing`, { headers: getAuthHeader() });
  return response.data;
};

import axios from 'axios';
import { API_BASE_URL } from '../config';

const USER_API_URL = `${API_BASE_URL}/users`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllUsers = async () => {
  const response = await axios.get(`${USER_API_URL}`, { headers: getAuthHeader() });
  return response.data;
};

export const getAllShippers = async () => {
  const response = await axios.get(`${USER_API_URL}/shippers`, { headers: getAuthHeader() });
  return response.data;
}; 

export const getUsersByRole = async (roleId) => {
  const response = await axios.get(`${USER_API_URL}/role/${roleId}`, { headers: getAuthHeader() });
  return response.data;
}; 
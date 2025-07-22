import axios from "axios";

const API_URL = "http://localhost:5000/api/invoices";


// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllInvoices = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

export const addInvoice = async (invoiceData) => {
  const response = await axios.post(API_URL, invoiceData, { headers: getAuthHeader() });
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
  return response.data;
};

export const deleteInvoice = async (id) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

export const exportInvoicePDF = async (id) => {
  // Sử dụng window.open để mở PDF trong tab mới, kèm token nếu có
  const token = localStorage.getItem('token');
  const url = token
    ? `${API_URL}/${id}/pdf?token=${encodeURIComponent(token)}`
    : `${API_URL}/${id}/pdf`;
  window.open(url, '_blank');
};
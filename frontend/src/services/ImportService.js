import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/imports`;

export const getAllImports = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getImportsByMonth = async (year) => {
  const response = await axios.get(`${API_URL}/by-year`, {
    params: { year }
  });
  return response.data;
};

export const getTopImportedBooks = async (limit = 5, month = null, year = null) => {
  let params = { limit };
  if (month) params.month = month;
  if (year) params.year = year;
  
  const response = await axios.get(`${API_URL}/top-books`, { params });
  return response.data;
};

export const getImportDataByMonth = async (year, month) => {
  const response = await axios.get(`${API_URL}/data/month`, {
    params: { year, month }
  });
  return response.data;
};

export const getImportDataByYear = async (year) => {
  const response = await axios.get(`${API_URL}/data/year`, {
    params: { year }
  });
  return response.data;
};

// Thêm các hàm mới cho biểu đồ
export const getImportChartDataByYear = async (year) => {
  const response = await axios.get(`${API_URL}/chart/year`, {
    params: { year }
  });
  return response.data;
};

export const getImportChartDataByMonth = async (year, month) => {
  const response = await axios.get(`${API_URL}/chart/month`, {
    params: { year, month }
  });
  return response.data;
};

export const getStockChartData = async () => {
  const response = await axios.get(`${API_URL}/stock-chart`);
  return response.data;
};

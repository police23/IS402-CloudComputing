import axios from "axios";

const API_URL = "http://localhost:5000/api/promotions";

export const getAllPromotions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addPromotion = async (promotionData) => {
  const response = await axios.post(API_URL, promotionData);
  return response.data;
};

export const updatePromotion = async (id, promotionData) => {
  const response = await axios.put(`${API_URL}/${id}`, promotionData);
  return response.data;
};

export const deletePromotion = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const checkPromotion = async (promotionCode, totalAmount) => {
  const response = await axios.post(`${API_URL}/check`, {
    promotionCode,
    totalAmount
  });
  return response.data;
};

export const getAvailablePromotions = async (totalAmount) => {
  const response = await axios.get(`${API_URL}/available`, {
    params: { total_price: totalAmount }
  });
  return response.data;
};
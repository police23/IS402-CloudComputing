import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/shipping-methods`;

export const getShippingMethods = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log('ShippingMethodService - API response:', response.data); // Debug log
    
    // API trả về { success: true, data: [...] }
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // Fallback cho format cũ
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return [];
  }
}; 
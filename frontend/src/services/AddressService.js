import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tạo instance axios với interceptor để tự động thêm token
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Lấy danh sách địa chỉ của user
export const getAddresses = async () => {
    try {
        const response = await apiClient.get('/addresses');
        return response.data;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

// Thêm địa chỉ mới
export const addAddress = async (addressData) => {
    try {
        const response = await apiClient.post('/addresses', addressData);
        return response.data;
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
};

// Cập nhật địa chỉ
export const updateAddress = async (addressId, addressData) => {
    try {
        const response = await apiClient.put(`/addresses/${addressId}`, addressData);
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

// Xóa địa chỉ
export const deleteAddress = async (addressId) => {
    try {
        const response = await apiClient.delete(`/addresses/${addressId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
};

// Đặt địa chỉ làm mặc định
export const setDefaultAddress = async (addressId) => {
    try {
        const response = await apiClient.put(`/addresses/${addressId}/default`);
        return response.data;
    } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
    }
}; 
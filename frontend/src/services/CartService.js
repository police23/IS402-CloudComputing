import axios from 'axios';

const API_URL = "http://localhost:5000/api/cart";

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

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

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getCart = async () => {
    try {
        const response = await apiClient.get('/cart');
        return response.data;
    } catch (error) {
        console.error('Error getting cart:', error);
        throw error;
    }
};

export const addToCart = async (bookID, quantity) => {
    try {
        console.log('CartService addToCart - bookID:', bookID, 'quantity:', quantity);
        const response = await apiClient.post('/cart', {
            bookID,
            quantity
        });
        console.log('CartService addToCart - response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

export const updateQuantity = async (bookID, quantity) => {
    try {
        const response = await apiClient.put('/cart/quantity', {
            bookID,
            quantity
        });
        return response.data;
    } catch (error) {
        console.error('Error updating quantity:', error);
        throw error;
    }
};

export const removeFromCart = async (bookID) => {
    try {
        const response = await apiClient.delete(`/cart/${bookID}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};

export const clearCart = async () => {
    try {
        const response = await apiClient.delete('/cart');
        return response.data;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};


import axios from 'axios';
import { API_BASE_URL } from '../config';

export const getBookById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/books/${id}`);
  return response.data;
};

export const getBookReviews = async (bookId) => {
  const response = await axios.get(`${API_BASE_URL}/books/${bookId}/reviews`);
  return response.data;
};

export const getRelatedBooks = async (bookId, categoryId) => {
  const response = await axios.get(`${API_BASE_URL}/books/related/${bookId}`, {
    params: { category: categoryId },
  });
  return response.data;
};

export const addToCart = async (bookId, quantity) => {
  const response = await axios.post(
    `${API_BASE_URL}/cart/add`,
    { bookId, quantity },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

export const addToWishlist = async (bookId) => {
  const response = await axios.post(
    `${API_BASE_URL}/wishlist/add`,
    { bookId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

export const removeFromWishlist = async (bookId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/wishlist/remove`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      data: { bookId },
    }
  );
  return response.data;
}; 
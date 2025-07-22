import axios from "axios";

const API_URL = "http://localhost:5000/api/books";

export const getAllBooks = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.success ? response.data.data : response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Failed to fetch books');
    }
    throw new Error('Failed to fetch books');
  }
};

export const getOldStockBooks = async (months = 2) => {
  try {
    const response = await axios.get(`${API_URL}/old-stock`, {
      params: { months },
    });
    return response.data.success ? response.data.data : response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Failed to fetch old stock books');
    }
    throw new Error('Failed to fetch old stock books');
  }
};

export const createBook = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || error.response.data.detail || 'Failed to create book');
    }
    throw new Error('Failed to create book');
  }
};

export const updateBook = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || error.response.data.detail || 'Failed to update book');
    }
    throw new Error('Failed to update book');
  }
};

export const deleteBook = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Failed to delete book');
    }
    throw new Error('Failed to delete book');
  }
};

export const getBookById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.error || 'Không tìm thấy sách');
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Không tìm thấy sách');
    }
    throw new Error('Không tìm thấy sách');
  }
};

export const getLatestBooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/latest-books`);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Failed to fetch latest books');
    }
    throw new Error('Failed to fetch latest books');
  }
};
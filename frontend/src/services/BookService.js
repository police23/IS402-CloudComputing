import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/books`;

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

// Fetch pricing view to get discounted_price/original_price without losing other associations
export const getAllBooksPricing = async () => {
  try {
    const response = await axios.get(API_URL, { params: { useView: 1 } });
    // Backend returns raw array from view
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch pricing view:', error?.response?.data || error.message);
    return [];
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
    // Backend trả về mảng sách trực tiếp, không có wrapper
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Failed to fetch latest books');
    }
    throw new Error('Failed to fetch latest books');
  }
};


// Lấy top 10 sách bán chạy (có ảnh) theo tháng/năm
export const getTop10MostSoldBooksAll = async (month, year) => {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const res = await axios.get(`${API_BASE}/reports/top10-all?month=${month}&year=${year}`);
    // Backend trả về { success: true, data: books }
    const books = res.data.success ? res.data.data : res.data;
    // Đảm bảo books là mảng
    const booksArray = Array.isArray(books) ? books : [];
    // Trả về đúng format cho HomePage: name, price, image
    return booksArray.map(book => ({
      id: book.id,
      name: book.title,
      price: book.price ? Number(book.price).toLocaleString('vi-VN') + 'đ' : '',
      image: book.image_path
        ? (book.image_path.startsWith('/uploads')
            ? (import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000') + book.image_path
            : book.image_path)
        : '/assets/no-image.png',
      total_sold: book.total_sold
    }));
  } catch (error) {
    console.error('Error fetching top 10 books:', error);
    return [];
  }
};

// Lấy sách cùng thể loại (sách liên quan)
export const getBooksByCategory = async (categoryId, excludeBookId, limit = 8) => {
  try {
    const response = await axios.get(`${API_URL}/category/${categoryId}`, {
      params: {
        excludeBookId,
        limit
      }
    });
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching books by category:', error);
    return [];
  }
};
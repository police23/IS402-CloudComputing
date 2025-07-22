import axiosInstance from '../utils/axiosInstance';

// Gửi đánh giá sách
export const rateBook = async (bookID, rating, comment) => {
  const response = await axiosInstance.post('/ratings/rate', {
    bookID,
    rating,
    comment,
  });
  return response.data;
};

// Lấy tất cả đánh giá của 1 sách
export const getRatingsByBookID = async (bookID) => {
  const response = await axiosInstance.get(`/ratings/book/${bookID}`);
  return response.data;
};

// Kiểm tra user đã mua sách này chưa
export const hasPurchasedBook = async (bookID) => {
  const response = await axiosInstance.get(`/ratings/has-purchased/${bookID}`);
  return response.data.purchased;
};

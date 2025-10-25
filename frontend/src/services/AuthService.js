import axios from 'axios';

// Cấu hình axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // URL API đúng tới backend
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Thêm interceptor để xử lý token trong header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // Mô phỏng người dùng cho môi trường phát triển
// const mockUsers = {
//   admin: {
//     id: 1,
//     username: 'admin',
//     password: 'admin123',
//     displayName: 'Quản trị viên',
//     role: 'ADMIN',
//     email: 'admin@example.com'
//   },
//   seller: {
//     id: 2,
//     username: 'seller',
//     password: 'seller123',
//     displayName: 'Nguyễn Văn Bán',
//     role: 'SALESPERSON',
//     email: 'seller@example.com'
//   },
//   inventory: {
//     id: 3,
//     username: 'inventory',
//     password: 'inventory123',
//     displayName: 'Trần Văn Kho',
//     role: 'INVENTORY',
//     email: 'inventory@example.com'
//   }
// };

const authService = {  // Hàm đăng nhập
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      
      // Lưu token vào localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // Định dạng lỗi để throw ra
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  },

  // Kiểm tra token có hợp lệ không
  validateToken: async () => {
    try {
      // Gọi API để xác thực token
      const response = await apiClient.get('/auth/validate-token');
      return response.data.user;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Mã lỗi 403 cho tài khoản bị khóa
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.message || 'Token không hợp lệ');
    }
  },
  register: async (userData) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.message || 'Đăng ký thất bại');
    }
  },
  // Đăng xuất (chỉ xử lý phía client, server sẽ blacklist token)
  logout: async () => {
    try {
      // Call API to logout and blacklist token
      const response = await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.message || 'Đăng xuất thất bại');
    }
  },

  // Forgot password functions
  sendOTP: async (email) => {
    try {
      // Đúng endpoint backend: /auth/forgot-password
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.message || 'Gửi OTP thất bại');
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      // Gửi đúng dữ liệu cho backend: { email, otp }
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.message || 'Xác thực OTP thất bại');
    }
  },

  resetPassword: async (email, newPassword, resetToken) => {
    try {
      // Gửi đủ thông tin cho backend: { email, newPassword, resetToken }
      const response = await apiClient.post('/auth/reset-password', {
        email,
        newPassword,
        resetToken
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.message || 'Đặt lại mật khẩu thất bại');
    }
  }
};

export default authService;

// Configuration for the application
export const API_BASE_URL = 'http://localhost:5000/api';

// Other configuration constants
export const APP_NAME = 'BookStore Management';
export const APP_VERSION = '1.0.0';

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  BOOKS: {
    LIST: '/books',
    DETAIL: '/books/:id',
    CREATE: '/books',
    UPDATE: '/books/:id',
    DELETE: '/books/:id',
  },
  USERS: {
    LIST: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/:id',
  },
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: '/categories/:id',
    DELETE: '/categories/:id',
  },
  PUBLISHERS: {
    LIST: '/publishers',
    CREATE: '/publishers',
    UPDATE: '/publishers/:id',
    DELETE: '/publishers/:id',
  },
  SUPPLIERS: {
    LIST: '/suppliers',
    CREATE: '/suppliers',
    UPDATE: '/suppliers/:id',
    DELETE: '/suppliers/:id',
  },
  IMPORTS: {
    LIST: '/imports',
    CREATE: '/imports',
    UPDATE: '/imports/:id',
    DELETE: '/imports/:id',
  },
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    UPDATE: '/invoices/:id',
    DELETE: '/invoices/:id',
  },
  PROMOTIONS: {
    LIST: '/promotions',
    CREATE: '/promotions',
    UPDATE: '/promotions/:id',
    DELETE: '/promotions/:id',
  },
  RULES: {
    LIST: '/rules',
    CREATE: '/rules',
    UPDATE: '/rules/:id',
    DELETE: '/rules/:id',
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
};

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

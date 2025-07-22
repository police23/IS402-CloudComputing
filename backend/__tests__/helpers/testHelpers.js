// Test helpers và utilities

/**
 * Tạo mock request object
 */
const createMockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: {},
    ...overrides
  };
};

/**
 * Tạo mock response object
 */
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Tạo mock user data
 */
const createMockUser = (overrides = {}) => {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

/**
 * Tạo mock book data
 */
const createMockBook = (overrides = {}) => {
  return {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    price: 100000,
    stock: 50,
    categoryId: 1,
    publisherId: 1,
    description: 'Test description',
    isbn: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

/**
 * Tạo JWT token giả
 */
const createMockToken = () => {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
};

/**
 * Tạo mock database connection
 */
const createMockConnection = () => {
  return {
    execute: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
  };
};

/**
 * Mock console methods để giảm noise trong test output
 */
const mockConsole = () => {
  const originalConsole = global.console;
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  };
  return originalConsole;
};

/**
 * Restore console methods
 */
const restoreConsole = (originalConsole) => {
  global.console = originalConsole;
};

/**
 * Tạo mock error với message và status code
 */
const createMockError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Wait for async operations trong tests
 */
const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tạo test data cho pagination
 */
const createPaginationData = (total, page = 1, limit = 10) => {
  return {
    data: [],
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

// Dummy test để thỏa mãn yêu cầu Jest
describe('Test Helpers', () => {
  test('should export all helper functions', () => {
    expect(typeof createMockRequest).toBe('function');
    expect(typeof createMockResponse).toBe('function');
    expect(typeof createMockUser).toBe('function');
    expect(typeof createMockBook).toBe('function');
    expect(typeof createMockToken).toBe('function');
  });
});

module.exports = {
  createMockRequest,
  createMockResponse,
  createMockUser,
  createMockBook,
  createMockToken,
  createMockConnection,
  mockConsole,
  restoreConsole,
  createMockError,
  waitFor,
  createPaginationData
};

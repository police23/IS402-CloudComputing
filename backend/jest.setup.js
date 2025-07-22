// Jest setup file
// Thiết lập môi trường test

// Mock console để giảm noise trong test output
global.console = {
  ...console,
  // Uncomment để tắt console.log trong tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Thiết lập timeout cho tests
jest.setTimeout(10000);

// Optional: configure or set up a testing framework before each test.
// For example, if you want to add matchers to Jest, uncomment the next line.
import '@testing-library/jest-dom/extend-expect';

// src/setupTests.js
import { server } from './mocks/server.js';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect subsequent tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
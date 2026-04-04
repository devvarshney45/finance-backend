// tests/auth.test.js
// Integration tests for auth routes using Jest + Supertest

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Import our Express app

// Before all tests, connect to a test database
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/finance_test_db');
});

// After all tests, clean up and disconnect
afterAll(async () => {
  await mongoose.connection.db.dropDatabase(); // Clean test data
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  let token; // We'll store the token to reuse across tests

  // Test: Register a new user
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
      });

    expect(res.statusCode).toBe(201);         // Expect 201 Created
    expect(res.body.success).toBe(true);       // Expect success flag
    expect(res.body.data.token).toBeDefined(); // Expect a token in response
  });

  // Test: Login with correct credentials
  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token; // Save token for next tests
  });

  // Test: Reject wrong password
  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401); // Expect 401 Unauthorized
  });

  // Test: Get current user with valid token
  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`); // Send token in header

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('admin@test.com');
  });
});
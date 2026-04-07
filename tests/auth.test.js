const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../index');

// ✅ FIX — Atlas ka hi URL use karo, local nahi
const TEST_DB  = process.env.MONGO_URI;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  // Test users clean karo
  try {
    await mongoose.connection.collection('users')
      .deleteMany({ email: { $in: ['admin@test.com'] } });
  } catch(e) {}
  await mongoose.disconnect();
});

describe('Auth Routes', () => {
  let token;

  it('should register a new user', async () => {
    // Pehle delete karo agar exist karta hai
    await mongoose.connection.collection('users')
      .deleteMany({ email: 'admin@test.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('admin@test.com');
  });
});
// tests/transaction.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');

let adminToken;
let viewerToken;
let transactionId;

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/finance_test_db2');

  // Register admin and viewer for testing
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Admin', email: 'admin2@test.com', password: 'pass123', role: 'admin',
  });
  adminToken = adminRes.body.data.token;

  const viewerRes = await request(app).post('/api/auth/register').send({
    name: 'Viewer', email: 'viewer@test.com', password: 'pass123', role: 'viewer',
  });
  viewerToken = viewerRes.body.data.token;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Transaction Routes', () => {
  it('should allow admin to create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5000, type: 'income', category: 'Salary', date: '2024-03-01' });

    expect(res.statusCode).toBe(201);
    transactionId = res.body.data.transaction._id; // Save for later
  });

  it('should NOT allow viewer to create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 100, type: 'expense', category: 'Food' });

    expect(res.statusCode).toBe(403); // 403 = Forbidden
  });

  it('should allow viewer to read transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('should only allow admin to delete a transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });
});
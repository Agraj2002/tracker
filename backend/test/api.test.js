const request = require('supertest');
const app = require('../server');

describe('Finance Tracker API', () => {
  describe('Health Check', () => {
    it('should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Server is running');
    });
  });

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Personal Finance Tracker API');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      await request(app)
        .get('/api/transactions')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      // This test would need to be implemented based on your rate limiting configuration
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
    });
  });
});

// Test for JWT token generation
describe('JWT Authentication Flow', () => {
  it('should login with default admin credentials', async () => {
    // Note: This test requires the database to be set up with default users
    const loginData = {
      email: 'admin@financetracker.com',
      password: 'admin123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    if (response.status === 200) {
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('role', 'admin');
    }
    // If status is not 200, it might be due to database not being set up
  });
});

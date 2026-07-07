/**
 * Auth integration tests.
 * Run with: npm test
 * Requires a test database configured in .env.test
 */
const request = require('supertest');
const app = require('../../src/app');

const testUser = {
  name: 'Test Student',
  email: `test_${Date.now()}@landmark.edu.gh`,
  password: 'TestPass@123',
  role: 'student',
  studentId: `TEST${Date.now()}`,
};

let authToken;

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new student', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      expect(res.statusCode).toBe(409);
    });

    it('should reject weak password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({ ...testUser, email: 'x@x.com', password: '123' });
      expect(res.statusCode).toBe(422);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
      authToken = res.body.data.token;
    });

    it('should reject wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: 'WrongPass@1' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout and blacklist token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('should reject blacklisted token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('Health Check', () => {
  it('GET /health should return healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

const request = require('supertest');
const app = require('./server');

describe('HMS API Tests', () => {

  describe('GET /health', () => {
    it('should return OK status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });

  describe('POST /patients - validation', () => {
    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/patients')
        .send({ name: 'John' }); // missing age and disease
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /patients/:id - not found', () => {
    it('should return 404 for non-existent patient', async () => {
      const res = await request(app).get('/patients/999999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /patients/:id - not found', () => {
    it('should return 404 for non-existent patient', async () => {
      const res = await request(app).delete('/patients/999999');
      expect(res.statusCode).toBe(404);
    });
  });

});

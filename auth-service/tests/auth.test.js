// File: devconnect/auth-service/tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

// This test suite requires a running MongoDB instance.
// For a production setup, use an in-memory db like 'mongodb-memory-server'.
describe('Auth Service Health Check', () => {
    // Disconnect mongoose after all tests
    afterAll(async () => {
        await mongoose.disconnect();
    });
    
    it('should return 200 and a success message for the root endpoint', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('Auth Service is running successfully.');
    });
});
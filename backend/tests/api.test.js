const request = require('supertest');
const app = require('../src/app');

describe('FlowState API Endpoints', () => {
    
    it('should return 200 and healthy status on /api/health', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
    });

    it('should return 400 if userLocation is missing on nudge request', async () => {
        const res = await request(app)
            .post('/api/recommendation/nudge')
            .send({}); // Empty body

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should return a valid nudge recommendation upon passing valid data', async () => {
        const res = await request(app)
            .post('/api/recommendation/nudge')
            .send({ userLocation: "North Gate" });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('nudgeText');
    });

});

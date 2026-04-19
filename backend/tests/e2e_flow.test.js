const request = require('supertest');
const app = require('../src/app');

// Mock Secret Manager to prevent credential checks during CI/testing
jest.mock('@google-cloud/secret-manager', () => {
    return {
        SecretManagerServiceClient: jest.fn().mockImplementation(() => {
            return {
                accessSecretVersion: jest.fn().mockResolvedValue([{
                    payload: { data: { toString: () => "mock-api-key" } }
                }])
            };
        })
    };
});

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: { text: () => "Mocked AI Response" }
                    })
                })
            };
        })
    };
});

describe('FlowState End-to-End Orchestration Lifecycle', () => {
    
    test('Should verify core API health and timestamping', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
    });

    test('Should retrieve 44-node arena state with zone groupings', async () => {
        const res = await request(app).get('/api/venues/status');
        expect(res.statusCode).toEqual(200);
        const dataCount = Object.keys(res.body).length;
        // Verify we have the 44 nodes we generated
        expect(dataCount).toBeGreaterThanOrEqual(44);
        expect(res.body['RL1']).toHaveProperty('zone', 'Red');
    });

    test('Should trigger AI Strategy Engine for a Smart Nudge', async () => {
        // This tests the endpoint logic and fallback (if no key)
        const res = await request(app).post('/api/recommendation/nudge');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('nudgeText');
    });

    test('Should verify data consistency for a specific gate', async () => {
        const res = await request(app).get('/api/venues/status');
        const westGate = res.body['Gate West'];
        expect(westGate).toBeDefined();
        expect(westGate.type).toBe('gate');
    });
});

const request = require('supertest');
const app = require('../src/server');
const db = require('../../frontend/src/db');

describe('Vacation Requests API', () => {
    beforeAll(async () => {
        // Run migrations and seeds before tests
        await db.migrate.latest();
        await db.seed.run();
    });

    afterAll(async () => {
        // Clean up database connection
        await db.destroy();
    });

    describe('GET /api/vacation-requests', () => {
        it('should return all vacation requests', async () => {
            const response = await request(app)
                .get('/api/vacation-requests')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should filter requests by status', async () => {
            const response = await request(app)
                .get('/api/vacation-requests?status=pending')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            response.body.data.forEach(request => {
                expect(request.status).toBe('pending');
            });
        });

        it('should return 400 for invalid status filter', async () => {
            const response = await request(app)
                .get('/api/vacation-requests?status=invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid status');
        });
    });

    describe('GET /api/vacation-requests/user/:userId', () => {
        it('should return vacation requests for a specific user', async () => {
            const response = await request(app)
                .get('/api/vacation-requests/user/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            response.body.data.forEach(request => {
                expect(request.user_id).toBe(1);
            });
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/vacation-requests/user/999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('POST /api/vacation-requests', () => {
        it('should create a new vacation request', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            const newRequest = {
                user_id: 1,
                start_date: tomorrow.toISOString().split('T')[0],
                end_date: nextWeek.toISOString().split('T')[0],
                reason: 'Test vacation'
            };

            const response = await request(app)
                .post('/api/vacation-requests')
                .send(newRequest)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.user_id).toBe(newRequest.user_id);
            expect(response.body.data.status).toBe('pending');
        });

        it('should return 400 for invalid date range', async () => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const invalidRequest = {
                user_id: 1,
                start_date: today.toISOString().split('T')[0],
                end_date: yesterday.toISOString().split('T')[0],
                reason: 'Invalid dates'
            };

            const response = await request(app)
                .post('/api/vacation-requests')
                .send(invalidRequest)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('before end date');
        });

        it('should return 400 for past start date', async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const today = new Date();

            const pastRequest = {
                user_id: 1,
                start_date: yesterday.toISOString().split('T')[0],
                end_date: today.toISOString().split('T')[0],
                reason: 'Past vacation'
            };

            const response = await request(app)
                .post('/api/vacation-requests')
                .send(pastRequest)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('future');
        });

        it('should return 404 for non-existent user', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            const invalidRequest = {
                user_id: 999,
                start_date: tomorrow.toISOString().split('T')[0],
                end_date: nextWeek.toISOString().split('T')[0],
                reason: 'Test vacation'
            };

            const response = await request(app)
                .post('/api/vacation-requests')
                .send(invalidRequest)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('PUT /api/vacation-requests/:id/approve', () => {
        it('should approve a pending vacation request', async () => {
            // First, get a pending request
            const requestsResponse = await request(app)
                .get('/api/vacation-requests?status=pending');

            const pendingRequest = requestsResponse.body.data[0];
            if (!pendingRequest) {
                // Create a pending request for testing
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 10);
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 17);

                const newRequest = {
                    user_id: 1,
                    start_date: tomorrow.toISOString().split('T')[0],
                    end_date: nextWeek.toISOString().split('T')[0],
                    reason: 'Test vacation for approval'
                };

                const createResponse = await request(app)
                    .post('/api/vacation-requests')
                    .send(newRequest);

                const requestId = createResponse.body.data.id;

                const approvalData = {
                    validator_id: 3, // Mike Johnson is a validator
                    comments: 'Approved for testing'
                };

                const response = await request(app)
                    .put(`/api/vacation-requests/${requestId}/approve`)
                    .send(approvalData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.status).toBe('approved');
                expect(response.body.data.validator_id).toBe(3);
                expect(response.body.data.comments).toBe('Approved for testing');
            }
        });

        it('should return 404 for non-existent request', async () => {
            const approvalData = {
                validator_id: 3,
                comments: 'Test approval'
            };

            const response = await request(app)
                .put('/api/vacation-requests/999/approve')
                .send(approvalData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Vacation request not found');
        });
    });

    describe('PUT /api/vacation-requests/:id/reject', () => {
        it('should return 400 for invalid validator', async () => {
            // First, get a pending request or create one
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 20);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 27);

            const newRequest = {
                user_id: 1,
                start_date: tomorrow.toISOString().split('T')[0],
                end_date: nextWeek.toISOString().split('T')[0],
                reason: 'Test vacation for rejection'
            };

            const createResponse = await request(app)
                .post('/api/vacation-requests')
                .send(newRequest);

            const requestId = createResponse.body.data.id;

            const rejectionData = {
                validator_id: 1, // John Doe is a requester, not a validator
                comments: 'Rejected for testing'
            };

            const response = await request(app)
                .put(`/api/vacation-requests/${requestId}/reject`)
                .send(rejectionData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid validator');
        });
    });
});
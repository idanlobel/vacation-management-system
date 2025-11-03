const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db');

describe('Users API', () => {
    beforeAll(async () => {
        // Run migrations and seeds before tests
        await db.migrate.latest();
        await db.seed.run();
    });

    afterAll(async () => {
        // Clean up database connection
        await db.destroy();
    });

    describe('GET /api/users', () => {
        it('should return all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a user by ID', async () => {
            const response = await request(app)
                .get('/api/users/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', 1);
            expect(response.body.data).toHaveProperty('name');
            expect(response.body.data).toHaveProperty('email');
            expect(response.body.data).toHaveProperty('role');
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/users/999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await request(app)
                .get('/api/users/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/users/role/:role', () => {
        it('should return users by role', async () => {
            const response = await request(app)
                .get('/api/users/role/requester')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            response.body.data.forEach(user => {
                expect(user.role).toBe('requester');
            });
        });

        it('should return 400 for invalid role', async () => {
            const response = await request(app)
                .get('/api/users/role/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid role');
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user', async () => {
            const newUser = {
                name: 'Test User',
                email: 'test@example.com',
                role: 'requester'
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(newUser.name);
            expect(response.body.data.email).toBe(newUser.email);
            expect(response.body.data.role).toBe(newUser.role);
        });

        it('should return 400 for missing required fields', async () => {
            const invalidUser = {
                name: 'Test User'
                // Missing email and role
            };

            const response = await request(app)
                .post('/api/users')
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation errors');
        });

        it('should return 409 for duplicate email', async () => {
            const duplicateUser = {
                name: 'Another User',
                email: 'john.doe@company.com', // This email already exists in seed data
                role: 'requester'
            };

            const response = await request(app)
                .post('/api/users')
                .send(duplicateUser)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
    });
});
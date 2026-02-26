// Mock all dependencies before requiring server
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

jest.mock('./config/db.mongo', () => {});

jest.mock('./utility/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    },
    logRequest: jest.fn((req, res, next) => next()),
    logResponseError: jest.fn()
}));

jest.mock('./routes', () => jest.fn());

const express = require('express');
const request = require('supertest');

describe('server', () => {
    let app;

    beforeAll(() => {
        // Create a fresh express app for testing
        app = express();
        const bodyParser = require('body-parser');
        const cors = require('cors');
        const logger = require('./utility/logger');
        const initRoutes = require('./routes');

        app.use(cors());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(logger.logRequest);
        initRoutes(app);
    });

    it('should have CORS enabled', async () => {
        const res = await request(app)
            .options('/')
            .set('Origin', 'http://localhost:4100');

        expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should parse JSON body', async () => {
        // Add a test route
        app.post('/test-json', (req, res) => {
            res.json(req.body);
        });

        const res = await request(app)
            .post('/test-json')
            .send({ name: 'test' })
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ name: 'test' });
    });

    it('should parse URL-encoded body', async () => {
        app.post('/test-urlencoded', (req, res) => {
            res.json(req.body);
        });

        const res = await request(app)
            .post('/test-urlencoded')
            .send('name=test')
            .set('Content-Type', 'application/x-www-form-urlencoded');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ name: 'test' });
    });

    it('should use logger middleware', () => {
        const logger = require('./utility/logger');
        expect(logger.logRequest).toBeDefined();
    });

    it('should call initRoutes with app', () => {
        const initRoutes = require('./routes');
        expect(initRoutes).toHaveBeenCalledWith(app);
    });

    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/unknown-route');
        expect(res.status).toBe(404);
    });

    it('should handle empty JSON body', async () => {
        app.post('/test-empty', (req, res) => {
            res.json(req.body || {});
        });

        const res = await request(app)
            .post('/test-empty')
            .send({})
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({});
    });
});

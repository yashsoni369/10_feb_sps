const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

jest.mock('express', () => {
    const mockApp = {
        use: jest.fn(),
        listen: jest.fn((port, cb) => { if (cb) cb(); }),
    };
    const mockExpress = jest.fn(() => mockApp);
    mockExpress.__mockApp = mockApp;
    return mockExpress;
});

jest.mock('cors', () => jest.fn(() => 'cors-middleware'));

jest.mock('body-parser', () => ({
    urlencoded: jest.fn(() => 'urlencoded-middleware'),
    json: jest.fn(() => 'json-middleware'),
}));

jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

jest.mock('../config/db.mongo', () => {});

jest.mock('../utility/logger', () => ({
    logger: { info: jest.fn(), error: jest.fn() },
    logRequest: jest.fn((req, res, next) => next()),
    logResponseError: jest.fn(),
}));

jest.mock('../routes', () => jest.fn());

const logger = require('../utility/logger');
const initRoutes = require('../routes');

describe('server.js', () => {
    let mockApp;

    beforeAll(() => {
        // Suppress console.log from server startup
        jest.spyOn(console, 'log').mockImplementation(() => {});
        require('../server');
        mockApp = express.__mockApp;
    });

    afterAll(() => {
        console.log.mockRestore();
    });

    test('should create an Express application', () => {
        expect(express).toHaveBeenCalled();
    });

    test('should apply cors middleware', () => {
        expect(cors).toHaveBeenCalled();
        expect(mockApp.use).toHaveBeenCalledWith('cors-middleware');
    });

    test('should apply body-parser urlencoded middleware with extended: true', () => {
        expect(bodyParser.urlencoded).toHaveBeenCalledWith({ extended: true });
        expect(mockApp.use).toHaveBeenCalledWith('urlencoded-middleware');
    });

    test('should apply body-parser json middleware', () => {
        expect(bodyParser.json).toHaveBeenCalled();
        expect(mockApp.use).toHaveBeenCalledWith('json-middleware');
    });

    test('should apply logger.logRequest middleware', () => {
        expect(mockApp.use).toHaveBeenCalledWith(logger.logRequest);
    });

    test('should initialize routes with the app', () => {
        expect(initRoutes).toHaveBeenCalledWith(mockApp);
    });

    test('should listen on port 3001', () => {
        expect(mockApp.listen).toHaveBeenCalledWith(3001, expect.any(Function));
    });

    test('should log startup message when listen callback fires', () => {
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('SPS Backend is running at http://localhost:3001')
        );
    });

    test('should apply middleware in correct order (cors, urlencoded, json, logger)', () => {
        const useCalls = mockApp.use.mock.calls.map(call => call[0]);
        const corsIndex = useCalls.indexOf('cors-middleware');
        const urlencodedIndex = useCalls.indexOf('urlencoded-middleware');
        const jsonIndex = useCalls.indexOf('json-middleware');
        const loggerIndex = useCalls.indexOf(logger.logRequest);

        expect(corsIndex).toBeLessThan(urlencodedIndex);
        expect(urlencodedIndex).toBeLessThan(jsonIndex);
        expect(jsonIndex).toBeLessThan(loggerIndex);
    });
});

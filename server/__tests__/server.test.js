// Mock all dependencies before requiring the module
const mockUse = jest.fn();
const mockListen = jest.fn((port, cb) => cb());
const mockApp = {
    use: mockUse,
    listen: mockListen,
};

jest.mock('express', () => {
    const expressFn = jest.fn(() => mockApp);
    return expressFn;
});

jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

jest.mock('body-parser', () => ({
    urlencoded: jest.fn(() => 'bodyparser-urlencoded-middleware'),
    json: jest.fn(() => 'bodyparser-json-middleware'),
}));

jest.mock('cors', () => jest.fn(() => 'cors-middleware'));

jest.mock('../routes', () => jest.fn());

jest.mock('../config/db.mongo', () => ({}));

jest.mock('../utility/logger', () => ({
    logRequest: jest.fn(),
    logger: { info: jest.fn(), error: jest.fn() },
}));

describe('server.js', () => {
    let cors;
    let bodyParser;
    let initRoutes;
    let logger;

    beforeAll(() => {
        // Suppress console.log from app.listen callback
        jest.spyOn(console, 'log').mockImplementation(() => {});

        // Require the server module — this executes the top-level code
        require('../server');

        cors = require('cors');
        bodyParser = require('body-parser');
        initRoutes = require('../routes');
        logger = require('../utility/logger');
    });

    afterAll(() => {
        console.log.mockRestore();
    });

    test('should initialize cors middleware', () => {
        expect(cors).toHaveBeenCalled();
        expect(mockUse).toHaveBeenCalledWith('cors-middleware');
    });

    test('should initialize body-parser urlencoded middleware with extended: true', () => {
        expect(bodyParser.urlencoded).toHaveBeenCalledWith({ extended: true });
        expect(mockUse).toHaveBeenCalledWith('bodyparser-urlencoded-middleware');
    });

    test('should initialize body-parser json middleware', () => {
        expect(bodyParser.json).toHaveBeenCalled();
        expect(mockUse).toHaveBeenCalledWith('bodyparser-json-middleware');
    });

    test('should register logger.logRequest as middleware', () => {
        expect(mockUse).toHaveBeenCalledWith(logger.logRequest);
    });

    test('should initialize routes with the app instance', () => {
        expect(initRoutes).toHaveBeenCalledWith(mockApp);
    });

    test('should listen on port 3001', () => {
        expect(mockListen).toHaveBeenCalledWith(3001, expect.any(Function));
    });

    test('should log startup message when listening', () => {
        expect(console.log).toHaveBeenCalledWith(
            '[server]: SPS Backend is running at http://localhost:3001'
        );
    });

    test('should register exactly 4 middleware via app.use()', () => {
        // cors, bodyParser.urlencoded, bodyParser.json, logger.logRequest
        expect(mockUse).toHaveBeenCalledTimes(4);
    });
});

const mockInfo = jest.fn();
const mockError = jest.fn();
const mockGetLogger = jest.fn(() => ({ info: mockInfo, error: mockError }));
const mockConfigure = jest.fn();

jest.mock('log4js', () => ({
    configure: mockConfigure,
    getLogger: mockGetLogger,
}));

const logger = require('../utility/logger');

describe('logger module', () => {
    // --- Exports ---

    test('should export logger, logRequest, and logResponseError', () => {
        expect(logger).toHaveProperty('logger');
        expect(logger).toHaveProperty('logRequest');
        expect(logger).toHaveProperty('logResponseError');
    });

    test('logRequest should be a function', () => {
        expect(typeof logger.logRequest).toBe('function');
    });

    test('logResponseError should be a function', () => {
        expect(typeof logger.logResponseError).toBe('function');
    });

    // --- log4js configuration (these check calls made during module load) ---

    test('should configure log4js with console and dateFile appenders', () => {
        expect(mockConfigure).toHaveBeenCalledTimes(1);
        const config = mockConfigure.mock.calls[0][0];
        expect(config.appenders).toHaveProperty('authlog');
        expect(config.appenders).toHaveProperty('console');
        expect(config.appenders.authlog.type).toBe('dateFile');
        expect(config.appenders.console.type).toBe('console');
    });

    test('should configure DEV, PROD, and default categories', () => {
        const config = mockConfigure.mock.calls[0][0];
        expect(config.categories).toHaveProperty('default');
        expect(config.categories).toHaveProperty('DEV');
        expect(config.categories).toHaveProperty('PROD');
    });

    test('should get logger with DEV category', () => {
        expect(mockGetLogger).toHaveBeenCalledWith('DEV');
    });

    // --- logRequest (clear only info/error mocks before these tests) ---

    describe('logRequest', () => {
        beforeEach(() => {
            mockInfo.mockClear();
            mockError.mockClear();
        });

        test('should call log.info with request details and call next()', () => {
            const req = {
                hostname: 'localhost',
                socket: { localPort: 3001 },
                originalUrl: '/api/users',
            };
            const res = {};
            const next = jest.fn();

            logger.logRequest(req, res, next);

            expect(mockInfo).toHaveBeenCalledTimes(1);
            const logMessage = mockInfo.mock.calls[0][0];
            expect(logMessage).toContain('localhost');
            expect(logMessage).toContain('3001');
            expect(logMessage).toContain('/api/users');
            expect(logMessage).toContain('Accessed Server\'s URL');
            expect(next).toHaveBeenCalledTimes(1);
        });

        test('should include hostname, port, and originalUrl in log message', () => {
            const req = {
                hostname: 'example.com',
                socket: { localPort: 8080 },
                originalUrl: '/api/health',
            };
            const next = jest.fn();

            logger.logRequest(req, {}, next);

            const logMessage = mockInfo.mock.calls[0][0];
            expect(logMessage).toMatch(/example\.com:8080\/api\/health/);
        });
    });

    // --- logResponseError ---

    describe('logResponseError', () => {
        beforeEach(() => {
            mockInfo.mockClear();
            mockError.mockClear();
        });

        test('should call log.error with error details', () => {
            const res = {
                req: {
                    hostname: 'localhost',
                    socket: { localPort: 3001 },
                    originalUrl: '/api/register',
                },
            };

            logger.logResponseError('Validation error', res, 400);

            expect(mockError).toHaveBeenCalledTimes(1);
            const logMessage = mockError.mock.calls[0][0];
            expect(logMessage).toContain('localhost');
            expect(logMessage).toContain('3001');
            expect(logMessage).toContain('/api/register');
            expect(logMessage).toContain('Validation error');
            expect(logMessage).toContain('400');
        });

        test('should include the status code in the error message', () => {
            const res = {
                req: {
                    hostname: 'myhost',
                    socket: { localPort: 5000 },
                    originalUrl: '/api/data',
                },
            };

            logger.logResponseError('Server crash', res, 500);

            const logMessage = mockError.mock.calls[0][0];
            expect(logMessage).toContain('HTTPStatusCode');
            expect(logMessage).toContain('500');
        });
    });
});

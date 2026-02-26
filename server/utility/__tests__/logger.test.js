// We need to capture the configure call args since log4js.configure is called
// at module load time. We store the args in a closure variable.
let capturedConfigureArgs = null;
let capturedGetLoggerCategory = null;

const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
};

jest.mock('log4js', () => ({
    configure: jest.fn((config) => {
        capturedConfigureArgs = config;
    }),
    getLogger: jest.fn((category) => {
        capturedGetLoggerCategory = category;
        return mockLogger;
    }),
}));

const log4js = require('log4js');
const { logger, logRequest, logResponseError } = require('../logger');

describe('utility/logger.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('log4js configuration', () => {
        it('should have called log4js.configure on module load', () => {
            expect(capturedConfigureArgs).not.toBeNull();
        });

        it('should configure with console and authlog appenders', () => {
            expect(capturedConfigureArgs.appenders).toHaveProperty('authlog');
            expect(capturedConfigureArgs.appenders).toHaveProperty('console');
            expect(capturedConfigureArgs.appenders.authlog.type).toBe('dateFile');
            expect(capturedConfigureArgs.appenders.console.type).toBe('console');
        });

        it('should configure DEV, PROD, and default categories', () => {
            expect(capturedConfigureArgs.categories).toHaveProperty('default');
            expect(capturedConfigureArgs.categories).toHaveProperty('DEV');
            expect(capturedConfigureArgs.categories).toHaveProperty('PROD');
        });

        it('should create logger with DEV category', () => {
            expect(capturedGetLoggerCategory).toBe('DEV');
        });
    });

    describe('logger export', () => {
        it('should export a logger object with standard log methods', () => {
            expect(logger).toBeDefined();
            expect(typeof logger.info).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.debug).toBe('function');
        });
    });

    describe('logRequest', () => {
        let mockReq, mockRes, mockNext;

        beforeEach(() => {
            mockReq = {
                hostname: 'localhost',
                socket: { localPort: 3000 },
                originalUrl: '/api/test',
            };
            mockRes = {};
            mockNext = jest.fn();
        });

        it('should call next() to pass control to the next middleware', () => {
            logRequest(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should log an info message containing the request hostname', () => {
            logRequest(mockReq, mockRes, mockNext);
            expect(mockLogger.info).toHaveBeenCalledTimes(1);
            const logMessage = mockLogger.info.mock.calls[0][0];
            expect(logMessage).toContain('localhost');
        });

        it('should log an info message containing the request port', () => {
            logRequest(mockReq, mockRes, mockNext);
            const logMessage = mockLogger.info.mock.calls[0][0];
            expect(logMessage).toContain('3000');
        });

        it('should log an info message containing the original URL', () => {
            logRequest(mockReq, mockRes, mockNext);
            const logMessage = mockLogger.info.mock.calls[0][0];
            expect(logMessage).toContain('/api/test');
        });

        it('should include the URL format hostname:port/path in the log', () => {
            logRequest(mockReq, mockRes, mockNext);
            const logMessage = mockLogger.info.mock.calls[0][0];
            expect(logMessage).toContain('localhost:3000/api/test');
        });
    });

    describe('logResponseError', () => {
        let mockRes;

        beforeEach(() => {
            mockRes = {
                req: {
                    hostname: 'localhost',
                    socket: { localPort: 3000 },
                    originalUrl: '/api/error',
                },
            };
        });

        it('should log an error message with the error details', () => {
            const err = new Error('Something went wrong');
            logResponseError(err, mockRes, 500);
            expect(mockLogger.error).toHaveBeenCalledTimes(1);
            const logMessage = mockLogger.error.mock.calls[0][0];
            expect(logMessage).toContain('Something went wrong');
        });

        it('should include the status code in the error log', () => {
            logResponseError('Bad request', mockRes, 400);
            const logMessage = mockLogger.error.mock.calls[0][0];
            expect(logMessage).toContain('400');
        });

        it('should include the request URL in the error log', () => {
            logResponseError('Not found', mockRes, 404);
            const logMessage = mockLogger.error.mock.calls[0][0];
            expect(logMessage).toContain('/api/error');
        });

        it('should include hostname and port in the error log', () => {
            logResponseError('Server error', mockRes, 500);
            const logMessage = mockLogger.error.mock.calls[0][0];
            expect(logMessage).toContain('localhost:3000');
        });

        it('should handle string errors', () => {
            logResponseError('string error message', mockRes, 422);
            const logMessage = mockLogger.error.mock.calls[0][0];
            expect(logMessage).toContain('string error message');
            expect(logMessage).toContain('422');
        });
    });
});

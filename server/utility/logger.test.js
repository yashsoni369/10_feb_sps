const loggerModule = require('./logger');

describe('logger', () => {
    describe('module exports', () => {
        it('should export logger object', () => {
            expect(loggerModule.logger).toBeDefined();
        });

        it('should export logRequest function', () => {
            expect(typeof loggerModule.logRequest).toBe('function');
        });

        it('should export logResponseError function', () => {
            expect(typeof loggerModule.logResponseError).toBe('function');
        });
    });

    describe('logger instance', () => {
        it('should have info method', () => {
            expect(typeof loggerModule.logger.info).toBe('function');
        });

        it('should have error method', () => {
            expect(typeof loggerModule.logger.error).toBe('function');
        });

        it('should have warn method', () => {
            expect(typeof loggerModule.logger.warn).toBe('function');
        });

        it('should have debug method', () => {
            expect(typeof loggerModule.logger.debug).toBe('function');
        });

        it('should have trace method', () => {
            expect(typeof loggerModule.logger.trace).toBe('function');
        });
    });

    describe('logRequest middleware', () => {
        it('should call next() to pass control to next middleware', () => {
            const req = {
                hostname: 'localhost',
                socket: { localPort: 3001 },
                originalUrl: '/api/test'
            };
            const res = {};
            const next = jest.fn();

            loggerModule.logRequest(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it('should not throw when called with valid req object', () => {
            const req = {
                hostname: '127.0.0.1',
                socket: { localPort: 8080 },
                originalUrl: '/api/regs'
            };
            const res = {};
            const next = jest.fn();

            expect(() => {
                loggerModule.logRequest(req, res, next);
            }).not.toThrow();
        });
    });

    describe('logResponseError', () => {
        it('should not throw when called with valid arguments', () => {
            const err = 'Test error';
            const res = {
                req: {
                    hostname: 'localhost',
                    socket: { localPort: 3001 },
                    originalUrl: '/api/test'
                }
            };
            const statusCode = 500;

            expect(() => {
                loggerModule.logResponseError(err, res, statusCode);
            }).not.toThrow();
        });

        it('should handle different status codes', () => {
            const res = {
                req: {
                    hostname: 'localhost',
                    socket: { localPort: 3001 },
                    originalUrl: '/api/regs'
                }
            };

            expect(() => {
                loggerModule.logResponseError('Not found', res, 404);
            }).not.toThrow();

            expect(() => {
                loggerModule.logResponseError('Bad request', res, 400);
            }).not.toThrow();
        });
    });
});

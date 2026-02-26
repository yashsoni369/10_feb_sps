// Mock the logger module before requiring responseHelper
jest.mock('../logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
    logResponseError: jest.fn(),
}));

const { sendResponse } = require('../responseHelper');
const log = require('../logger');

/**
 * Helper to create a mock Express response object.
 */
function createMockRes() {
    const res = {
        req: {
            hostname: 'localhost',
            socket: { localPort: 3000 },
            originalUrl: '/api/test',
        },
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
    };
    return res;
}

describe('utility/responseHelper.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendResponse - error scenarios', () => {
        it('should respond with the given statusCode when error and statusCode are provided', () => {
            const res = createMockRes();
            const error = new Error('Not Found');

            sendResponse({
                statusCode: 404,
                error,
                res,
                message: 'Resource not found',
                data: null,
            });

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Resource not found',
                data: null,
            });
        });

        it('should log the response error when error and statusCode are provided', () => {
            const res = createMockRes();
            const error = new Error('Bad Request');

            sendResponse({
                statusCode: 400,
                error,
                res,
                message: 'Validation failed',
                data: null,
            });

            expect(log.logResponseError).toHaveBeenCalledWith(error, res, 400);
        });

        it('should use error.message when message is empty string and statusCode is provided', () => {
            const res = createMockRes();
            const error = new Error('Original error message');

            sendResponse({
                statusCode: 422,
                error,
                res,
                message: '',
                data: null,
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Original error message',
                data: null,
            });
        });

        it('should handle statusCode === 0 as service unreachable (known bug: throws due to const reassignment)', () => {
            const res = createMockRes();
            const error = new Error('Connection refused');

            // NOTE: The source code has a bug at line 26 of responseHelper.js where
            // it tries to reassign the destructured `const message` variable.
            // This test documents the bug by asserting it throws a TypeError.
            expect(() => {
                sendResponse({
                    statusCode: 0,
                    error,
                    res,
                    message: '',
                    data: null,
                });
            }).toThrow(TypeError);
        });

        it('should default to 500 Internal Server Error when error exists but no statusCode', () => {
            const res = createMockRes();
            const error = new Error('Unexpected failure');

            sendResponse({
                statusCode: undefined,
                error,
                res,
                message: 'Something broke',
                data: null,
            });

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                data: null,
            });
        });

        it('should log the error when falling back to 500', () => {
            const res = createMockRes();
            const error = new Error('Unexpected failure');

            sendResponse({
                statusCode: undefined,
                error,
                res,
                message: 'Something broke',
                data: null,
            });

            expect(log.logResponseError).toHaveBeenCalledWith(
                'Something broke',
                res,
                undefined
            );
        });
    });

    describe('sendResponse - success scenarios', () => {
        it('should respond with the given statusCode on success', () => {
            const res = createMockRes();

            sendResponse({
                statusCode: 201,
                error: null,
                res,
                message: 'Created successfully',
                data: { id: 1, name: 'Test' },
            });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Created successfully',
                data: { id: 1, name: 'Test' },
            });
        });

        it('should default to 200 when no statusCode is provided on success', () => {
            const res = createMockRes();

            sendResponse({
                statusCode: undefined,
                error: null,
                res,
                message: 'OK',
                data: [1, 2, 3],
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                message: 'OK',
                data: [1, 2, 3],
            });
        });

        it('should not log any error on success responses', () => {
            const res = createMockRes();

            sendResponse({
                statusCode: 200,
                error: null,
                res,
                message: 'Success',
                data: { result: true },
            });

            expect(log.logResponseError).not.toHaveBeenCalled();
        });

        it('should handle null data on success', () => {
            const res = createMockRes();

            sendResponse({
                statusCode: 200,
                error: null,
                res,
                message: 'No content',
                data: null,
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                message: 'No content',
                data: null,
            });
        });

        it('should handle empty object data on success', () => {
            const res = createMockRes();

            sendResponse({
                statusCode: 200,
                error: null,
                res,
                message: 'Empty result',
                data: {},
            });

            expect(res.send).toHaveBeenCalledWith({
                message: 'Empty result',
                data: {},
            });
        });

        it('should handle falsy error (null) with statusCode 0 as success path', () => {
            const res = createMockRes();

            sendResponse({
                statusCode: 0,
                error: null,
                res,
                message: 'Zero status',
                data: null,
            });

            // No error, but statusCode is 0 (falsy), so falls to the else branch (200 default)
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});

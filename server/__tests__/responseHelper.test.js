jest.mock('../utility/logger', () => ({
    logResponseError: jest.fn(),
    logger: { info: jest.fn(), error: jest.fn() },
}));

const { sendResponse } = require('../utility/responseHelper');
const log = require('../utility/logger');

describe('responseHelper - sendResponse()', () => {
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            req: {
                hostname: 'localhost',
                socket: { localPort: 3001 },
                originalUrl: '/api/test',
            },
        };
    });

    // ─── Success Scenarios ───────────────────────────────────────────

    test('should return 200 with data and message on success (no statusCode)', () => {
        sendResponse({
            res: mockRes,
            error: null,
            statusCode: undefined,
            message: 'Success',
            data: { id: 1 },
        });

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Success',
            data: { id: 1 },
        });
    });

    test('should return custom statusCode with data on success', () => {
        sendResponse({
            res: mockRes,
            error: null,
            statusCode: 201,
            message: 'Created',
            data: { id: 2 },
        });

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Created',
            data: { id: 2 },
        });
    });

    test('should return 200 with null data on success', () => {
        sendResponse({
            res: mockRes,
            error: null,
            statusCode: undefined,
            message: 'No data',
            data: null,
        });

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'No data',
            data: null,
        });
    });

    test('should return 200 with empty array data on success', () => {
        sendResponse({
            res: mockRes,
            error: null,
            statusCode: undefined,
            message: 'Empty list',
            data: [],
        });

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Empty list',
            data: [],
        });
    });

    // ─── Error Scenarios ─────────────────────────────────────────────

    test('should return provided statusCode and message on error with statusCode', () => {
        const error = new Error('Not Found');

        sendResponse({
            res: mockRes,
            error,
            statusCode: 404,
            message: 'Resource not found',
            data: null,
        });

        expect(log.logResponseError).toHaveBeenCalledWith(error, mockRes, 404);
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Resource not found',
            data: null,
        });
    });

    test('should fall back to error.message when message is empty string and statusCode is provided', () => {
        const error = new Error('Validation failed');

        sendResponse({
            res: mockRes,
            error,
            statusCode: 400,
            message: '',
            data: null,
        });

        expect(log.logResponseError).toHaveBeenCalledWith(error, mockRes, 400);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Validation failed',
            data: null,
        });
    });

    test('should throw when statusCode is 0 due to const reassignment bug in source', () => {
        // NOTE: The source code destructures `message` with `const` but then
        // attempts to reassign it on the statusCode === 0 branch (line 26).
        // This is a known bug in utility/responseHelper.js.
        const error = new Error('Connection refused');

        expect(() => {
            sendResponse({
                res: mockRes,
                error,
                statusCode: 0,
                message: 'original message',
                data: null,
            });
        }).toThrow('Assignment to constant variable.');
    });

    test('should return 500 Internal Server Error when error exists but no statusCode', () => {
        const error = new Error('Unexpected crash');

        sendResponse({
            res: mockRes,
            error,
            statusCode: undefined,
            message: 'Something went wrong',
            data: null,
        });

        expect(log.logResponseError).toHaveBeenCalledWith(
            'Something went wrong',
            mockRes,
            undefined
        );
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Internal Server Error',
            data: null,
        });
    });

    // ─── Edge Cases ──────────────────────────────────────────────────

    test('should not call logResponseError on success', () => {
        sendResponse({
            res: mockRes,
            error: null,
            statusCode: 200,
            message: 'OK',
            data: {},
        });

        expect(log.logResponseError).not.toHaveBeenCalled();
    });

    test('should handle error with statusCode 500 explicitly', () => {
        const error = new Error('DB error');

        sendResponse({
            res: mockRes,
            error,
            statusCode: 500,
            message: 'Database failure',
            data: null,
        });

        expect(log.logResponseError).toHaveBeenCalledWith(error, mockRes, 500);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Database failure',
            data: null,
        });
    });

    test('should set data to null in all error responses', () => {
        const error = new Error('Forbidden');

        sendResponse({
            res: mockRes,
            error,
            statusCode: 403,
            message: 'Access denied',
            data: { sensitive: true },
        });

        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Access denied',
            data: null,
        });
    });
});

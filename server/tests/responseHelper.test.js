jest.mock('../utility/logger', () => ({
    logger: { info: jest.fn(), error: jest.fn() },
    logRequest: jest.fn(),
    logResponseError: jest.fn(),
}));

const { sendResponse } = require('../utility/responseHelper');
const log = require('../utility/logger');

function createMockRes() {
    const res = {
        status: jest.fn(),
        send: jest.fn(),
        req: {
            hostname: 'localhost',
            socket: { localPort: 3001 },
            originalUrl: '/api/test',
        },
    };
    res.status.mockReturnValue(res);
    return res;
}

describe('responseHelper - sendResponse', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Error scenarios ---

    test('should send error response with provided statusCode and log the error', () => {
        const res = createMockRes();
        const error = new Error('Not Found');

        sendResponse({ statusCode: 404, error, res, message: 'Resource not found', data: null });

        expect(log.logResponseError).toHaveBeenCalledWith(error, res, 404);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Resource not found', data: null });
    });

    test('should use error.message when message is empty string', () => {
        const res = createMockRes();
        const error = new Error('Validation failed');

        sendResponse({ statusCode: 400, error, res, message: '', data: null });

        expect(log.logResponseError).toHaveBeenCalledWith(error, res, 400);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message: 'Validation failed', data: null });
    });

    test('should throw when statusCode === 0 due to const reassignment bug in source', () => {
        const res = createMockRes();
        const error = new Error('Service down');

        // The source code has a bug: it tries to reassign `const message`
        // which throws a TypeError at runtime
        expect(() => {
            sendResponse({ statusCode: 0, error, res, message: '', data: null });
        }).toThrow(TypeError);
    });

    test('should send 500 Internal Server Error when error exists but no statusCode', () => {
        const res = createMockRes();
        const error = new Error('Unexpected');

        sendResponse({ statusCode: undefined, error, res, message: 'Something broke', data: null });

        expect(log.logResponseError).toHaveBeenCalledWith('Something broke', res, undefined);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Internal Server Error', data: null });
    });

    // --- Success scenarios ---

    test('should send success response with provided statusCode', () => {
        const res = createMockRes();
        const data = { id: 1, name: 'Test' };

        sendResponse({ statusCode: 201, error: null, res, message: 'Created', data });

        expect(log.logResponseError).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ message: 'Created', data });
    });

    test('should default to 200 when success and no statusCode provided', () => {
        const res = createMockRes();
        const data = [{ id: 1 }, { id: 2 }];

        sendResponse({ statusCode: undefined, error: null, res, message: 'OK', data });

        expect(log.logResponseError).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ message: 'OK', data });
    });

    test('should send success with null data when data is null', () => {
        const res = createMockRes();

        sendResponse({ statusCode: 200, error: null, res, message: 'No content', data: null });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ message: 'No content', data: null });
    });

    test('should not log any error on success responses', () => {
        const res = createMockRes();

        sendResponse({ statusCode: 200, error: null, res, message: 'Success', data: {} });

        expect(log.logResponseError).not.toHaveBeenCalled();
    });
});

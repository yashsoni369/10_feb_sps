const { sendResponse } = require('./responseHelper');

// Mock the logger module
jest.mock('./logger', () => ({
    logResponseError: jest.fn()
}));

const log = require('./logger');

describe('responseHelper', () => {
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            req: {
                hostname: 'localhost',
                socket: { localPort: 3001 },
                originalUrl: '/api/test'
            }
        };
        jest.clearAllMocks();
    });

    describe('sendResponse', () => {
        it('should send success response with statusCode 200', () => {
            const response = {
                statusCode: 200,
                message: 'Success',
                data: { id: 1 },
                res: mockRes
            };

            sendResponse(response);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'Success',
                data: { id: 1 }
            });
        });

        it('should send success response with statusCode 201', () => {
            const response = {
                statusCode: 201,
                message: 'Created',
                data: { id: 2 },
                res: mockRes
            };

            sendResponse(response);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'Created',
                data: { id: 2 }
            });
        });

        it('should send error response with statusCode when error is present', () => {
            const response = {
                statusCode: 500,
                message: 'Internal Server Error',
                data: null,
                res: mockRes,
                error: new Error('DB Error')
            };

            sendResponse(response);

            expect(log.logResponseError).toHaveBeenCalledWith(
                response.error,
                mockRes,
                500
            );
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                data: null
            });
        });

        it('should send error response with 500 when no statusCode and error present', () => {
            const response = {
                statusCode: undefined,
                message: 'Something went wrong',
                data: null,
                res: mockRes,
                error: new Error('Unknown')
            };

            sendResponse(response);

            expect(log.logResponseError).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                data: null
            });
        });

        it('should use error.message when message is empty string', () => {
            const error = new Error('Specific error');
            const response = {
                statusCode: 400,
                message: '',
                data: null,
                res: mockRes,
                error: error
            };

            sendResponse(response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'Specific error',
                data: null
            });
        });

        it('should throw when statusCode is 0 due to const reassignment bug in source', () => {
            const response = {
                statusCode: 0,
                message: '',
                data: null,
                res: mockRes,
                error: new Error('Service down')
            };

            // The source code has a bug: it destructures `message` as const
            // then tries to reassign it on line 26, causing a TypeError
            expect(() => sendResponse(response)).toThrow(TypeError);
        });

        it('should send 200 when no statusCode and no error', () => {
            const response = {
                statusCode: undefined,
                message: 'OK',
                data: { result: true },
                res: mockRes
            };

            sendResponse(response);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'OK',
                data: { result: true }
            });
        });

        it('should send response with null data on success', () => {
            const response = {
                statusCode: 200,
                message: 'No content',
                data: null,
                res: mockRes
            };

            sendResponse(response);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'No content',
                data: null
            });
        });

        it('should send response with array data', () => {
            const response = {
                statusCode: 200,
                message: 'List',
                data: [1, 2, 3],
                res: mockRes
            };

            sendResponse(response);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'List',
                data: [1, 2, 3]
            });
        });

        it('should send 404 response without error', () => {
            const response = {
                statusCode: 404,
                message: 'Not Found',
                data: '',
                res: mockRes
            };

            sendResponse(response);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'Not Found',
                data: ''
            });
        });
    });
});

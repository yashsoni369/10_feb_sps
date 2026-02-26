const { sendResponse } = require('../../utility/responseHelper');

jest.mock('../../utility/logger', () => ({
  logResponseError: jest.fn()
}));

const logger = require('../../utility/logger');

describe('responseHelper', () => {
  let res;

  beforeEach(() => {
    res = {
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
    it('should send 200 with data when no error and no statusCode', () => {
      sendResponse({ res, message: 'Success', data: { id: 1 } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'Success', data: { id: 1 } });
    });

    it('should send custom statusCode with data when no error', () => {
      sendResponse({ statusCode: 201, res, message: 'Created', data: { id: 2 } });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ message: 'Created', data: { id: 2 } });
    });

    it('should send error with provided statusCode and log the error', () => {
      const error = new Error('Not Found');
      sendResponse({ statusCode: 404, error, res, message: 'Resource not found', data: null });

      expect(logger.logResponseError).toHaveBeenCalledWith(error, res, 404);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Resource not found', data: null });
    });

    it('should use error.message when message is empty string', () => {
      const error = new Error('Custom error message');
      sendResponse({ statusCode: 400, error, res, message: '', data: null });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'Custom error message', data: null });
    });

    it('should send 500 Internal Server Error when error exists but no statusCode', () => {
      const error = new Error('Unknown');
      sendResponse({ error, res, message: 'Something went wrong', data: null });

      expect(logger.logResponseError).toHaveBeenCalledWith('Something went wrong', res, undefined);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Internal Server Error', data: null });
    });

    it('should handle error with statusCode 0 (service unreachable) - known bug: const reassignment', () => {
      const error = new Error('Service down');

      // Note: The source code has a bug where it tries to reassign a destructured const `message`.
      // This test documents the bug by expecting the TypeError to be thrown.
      expect(() => {
        sendResponse({ statusCode: 0, error, res, message: '', data: null });
      }).toThrow(TypeError);
    });

    it('should send 200 with empty data when no error and data is null', () => {
      sendResponse({ res, message: 'No content', data: null });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'No content', data: null });
    });

    it('should send 200 with array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      sendResponse({ res, message: 'List', data });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'List', data });
    });
  });
});

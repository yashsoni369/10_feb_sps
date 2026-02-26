const logger = require('../../utility/logger');

describe('logger', () => {
  describe('module exports', () => {
    it('should export a logger object', () => {
      expect(logger.logger).toBeDefined();
    });

    it('should export logRequest function', () => {
      expect(typeof logger.logRequest).toBe('function');
    });

    it('should export logResponseError function', () => {
      expect(typeof logger.logResponseError).toBe('function');
    });
  });

  describe('logger instance', () => {
    it('should have info method', () => {
      expect(typeof logger.logger.info).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof logger.logger.error).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof logger.logger.warn).toBe('function');
    });

    it('should have debug method', () => {
      expect(typeof logger.logger.debug).toBe('function');
    });

    it('should have trace method', () => {
      expect(typeof logger.logger.trace).toBe('function');
    });
  });

  describe('logRequest', () => {
    it('should call next() after logging', () => {
      const req = {
        hostname: 'localhost',
        socket: { localPort: 3001 },
        originalUrl: '/api/test'
      };
      const res = {};
      const next = jest.fn();

      logger.logRequest(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should not throw with valid request object', () => {
      const req = {
        hostname: '127.0.0.1',
        socket: { localPort: 8080 },
        originalUrl: '/api/regs'
      };
      const res = {};
      const next = jest.fn();

      expect(() => logger.logRequest(req, res, next)).not.toThrow();
    });
  });

  describe('logResponseError', () => {
    it('should not throw when logging an error', () => {
      const err = 'Test error message';
      const res = {
        req: {
          hostname: 'localhost',
          socket: { localPort: 3001 },
          originalUrl: '/api/test'
        }
      };

      expect(() => logger.logResponseError(err, res, 500)).not.toThrow();
    });

    it('should handle Error objects', () => {
      const err = new Error('Something went wrong');
      const res = {
        req: {
          hostname: 'localhost',
          socket: { localPort: 3001 },
          originalUrl: '/api/regs/register'
        }
      };

      expect(() => logger.logResponseError(err, res, 400)).not.toThrow();
    });

    it('should handle different status codes', () => {
      const err = 'Not found';
      const res = {
        req: {
          hostname: 'localhost',
          socket: { localPort: 3001 },
          originalUrl: '/api/regs'
        }
      };

      expect(() => logger.logResponseError(err, res, 404)).not.toThrow();
      expect(() => logger.logResponseError(err, res, 500)).not.toThrow();
      expect(() => logger.logResponseError(err, res, 503)).not.toThrow();
    });
  });
});

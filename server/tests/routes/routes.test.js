describe('Routes', () => {
  describe('Main Route Setup (routes/index.js)', () => {
    it('should export a function', () => {
      const initRoutes = require('../../routes/index');
      expect(typeof initRoutes).toBe('function');
    });

    it('should call app.use with /api prefix', () => {
      const initRoutes = require('../../routes/index');
      const app = { use: jest.fn() };

      initRoutes(app);

      expect(app.use).toHaveBeenCalledWith('/api', expect.anything());
    });
  });

  describe('API Router (routes/api/index.js)', () => {
    it('should export a router object', () => {
      const apiRouter = require('../../routes/api/index');
      expect(apiRouter).toBeDefined();
      expect(typeof apiRouter).toBe('function');
    });
  });

  describe('Registration Routes (routes/api/regs.routes.js)', () => {
    it('should export a function', () => {
      const setupRegsRoutes = require('../../routes/api/regs.routes');
      expect(typeof setupRegsRoutes).toBe('function');
    });

    it('should register all expected routes on the router', () => {
      const setupRegsRoutes = require('../../routes/api/regs.routes');
      const router = {
        get: jest.fn(),
        post: jest.fn()
      };

      setupRegsRoutes(router);

      // GET routes
      expect(router.get).toHaveBeenCalledWith('/regs/autofill', expect.any(Function));
      expect(router.get).toHaveBeenCalledWith('/regs/autofillName', expect.any(Function));
      expect(router.get).toHaveBeenCalledWith('/regs/formData', expect.any(Function));
      expect(router.get).toHaveBeenCalledWith('/regs', expect.any(Function));
      expect(router.get).toHaveBeenCalledWith('/regs/sabhaList', expect.any(Function));

      // POST routes
      expect(router.post).toHaveBeenCalledWith('/regs/register', expect.any(Function));
      expect(router.post).toHaveBeenCalledWith('/regs/remove', expect.any(Function));
    });

    it('should register exactly 5 GET routes and 2 POST routes', () => {
      const setupRegsRoutes = require('../../routes/api/regs.routes');
      const router = {
        get: jest.fn(),
        post: jest.fn()
      };

      setupRegsRoutes(router);

      expect(router.get).toHaveBeenCalledTimes(5);
      expect(router.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Admin Routes (routes/api/admin.routes.js.js)', () => {
    it('should export a function', () => {
      const setupAdminRoutes = require('../../routes/api/admin.routes.js');
      expect(typeof setupAdminRoutes).toBe('function');
    });

    it('should register dashboard route', () => {
      const setupAdminRoutes = require('../../routes/api/admin.routes.js');
      const router = {
        get: jest.fn(),
        post: jest.fn()
      };

      setupAdminRoutes(router);

      expect(router.get).toHaveBeenCalledWith('/dashboard/mandalWise', expect.any(Function));
    });

    it('should register exactly 1 GET route', () => {
      const setupAdminRoutes = require('../../routes/api/admin.routes.js');
      const router = {
        get: jest.fn(),
        post: jest.fn()
      };

      setupAdminRoutes(router);

      expect(router.get).toHaveBeenCalledTimes(1);
    });
  });
});

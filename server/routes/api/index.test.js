jest.mock('./regs.routes', () => jest.fn());
jest.mock('./admin.routes.js', () => jest.fn());

const apiRouter = require('./index');

describe('routes/api/index', () => {
    it('should export a router', () => {
        expect(apiRouter).toBeDefined();
    });

    it('should call setupSSLRoutes (regs routes)', () => {
        const setupSSLRoutes = require('./regs.routes');
        expect(setupSSLRoutes).toHaveBeenCalledWith(apiRouter);
    });

    it('should call setupAdmin (admin routes)', () => {
        const setupAdmin = require('./admin.routes.js');
        expect(setupAdmin).toHaveBeenCalledWith(apiRouter);
    });

    it('should have router methods available', () => {
        expect(typeof apiRouter.get).toBe('function');
        expect(typeof apiRouter.post).toBe('function');
        expect(typeof apiRouter.put).toBe('function');
        expect(typeof apiRouter.delete).toBe('function');
    });
});

jest.mock('../../controllers/admin.controller.js', () => ({
    mandalDashboard: jest.fn()
}));

const setupAdminRoutes = require('./admin.routes.js');
const adminController = require('../../controllers/admin.controller.js');

describe('admin.routes', () => {
    let mockRouter;

    beforeEach(() => {
        mockRouter = {
            get: jest.fn(),
            post: jest.fn()
        };
    });

    it('should export a function', () => {
        expect(typeof setupAdminRoutes).toBe('function');
    });

    it('should register GET /dashboard/mandalWise route', () => {
        setupAdminRoutes(mockRouter);

        expect(mockRouter.get).toHaveBeenCalledWith(
            '/dashboard/mandalWise',
            adminController.mandalDashboard
        );
    });

    it('should register exactly 1 GET route', () => {
        setupAdminRoutes(mockRouter);

        expect(mockRouter.get).toHaveBeenCalledTimes(1);
    });

    it('should not register any POST routes', () => {
        setupAdminRoutes(mockRouter);

        expect(mockRouter.post).not.toHaveBeenCalled();
    });
});

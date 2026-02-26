jest.mock('./api', () => 'mockApiRouter');

const initRoutes = require('./index');

describe('routes/index', () => {
    it('should export a function', () => {
        expect(typeof initRoutes).toBe('function');
    });

    it('should register /api route with apiRouter', () => {
        const mockApp = {
            use: jest.fn()
        };

        initRoutes(mockApp);

        expect(mockApp.use).toHaveBeenCalledWith('/api', 'mockApiRouter');
    });

    it('should call app.use exactly once', () => {
        const mockApp = {
            use: jest.fn()
        };

        initRoutes(mockApp);

        expect(mockApp.use).toHaveBeenCalledTimes(1);
    });
});

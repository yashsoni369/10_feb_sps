jest.mock('../../controllers/regs.controller', () => ({
    mobileAutofill: jest.fn(),
    nameAutofill: jest.fn(),
    formDataFromMobile: jest.fn(),
    register: jest.fn(),
    getAll: jest.fn(),
    getSabhaList: jest.fn(),
    deRegisterMember: jest.fn()
}));

const setupRegsRoutes = require('./regs.routes');
const regsController = require('../../controllers/regs.controller');

describe('regs.routes', () => {
    let mockRouter;

    beforeEach(() => {
        mockRouter = {
            get: jest.fn(),
            post: jest.fn()
        };
    });

    it('should export a function', () => {
        expect(typeof setupRegsRoutes).toBe('function');
    });

    it('should register GET /regs/autofill route', () => {
        setupRegsRoutes(mockRouter);

        expect(mockRouter.get).toHaveBeenCalledWith(
            '/regs/autofill',
            regsController.mobileAutofill
        );
    });

    it('should register GET /regs/autofillName route', () => {
        setupRegsRoutes(mockRouter);

        expect(mockRouter.get).toHaveBeenCalledWith(
            '/regs/autofillName',
            regsController.nameAutofill
        );
    });

    it('should register GET /regs/formData route', () => {
        setupRegsRoutes(mockRouter);

        expect(mockRouter.get).toHaveBeenCalledWith(
            '/regs/formData',
            regsController.formDataFromMobile
        );
    });

    it('should register POST /regs/register route', () => {
        setupRegsRoutes(mockRouter);

        expect(mockRouter.post).toHaveBeenCalledWith(
            '/regs/register',
            regsController.register
        );
    });

    it('should register GET /regs route', () => {
        setupRegsRoutes(mockRouter);

        expect(mockRouter.get).toHaveBeenCalledWith(
            '/regs',
            regsController.getAll
        );
    });

    it('should register GET /regs/sabhaList route', () => {
        setupRegsRoutes(mockRouter);

        expect(mockRouter.get).toHaveBeenCalledWith(
            '/regs/sabhaList',
            regsController.getSabhaList
        );
    });

    it('should register POST /regs/remove route', () => {
        setupRegsRoutes(mockRouter);

        expect(mockRouter.post).toHaveBeenCalledWith(
            '/regs/remove',
            regsController.deRegisterMember
        );
    });

    it('should register 5 GET routes and 2 POST routes', () => {
        setupRegsRoutes(mockRouter);

        expect(mockRouter.get).toHaveBeenCalledTimes(5);
        expect(mockRouter.post).toHaveBeenCalledTimes(2);
    });
});

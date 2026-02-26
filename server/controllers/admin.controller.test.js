jest.mock('../services/admin.service.js', () => ({
    regsByMandal: jest.fn()
}));

jest.mock('../utility/responseHelper', () => ({
    sendResponse: jest.fn()
}));

const adminController = require('./admin.controller');
const adminService = require('../services/admin.service.js');
const responseHelper = require('../utility/responseHelper');

describe('adminController', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = { query: {}, body: {}, params: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('mandalDashboard', () => {
        it('should call adminService.regsByMandal and sendResponse', async () => {
            const serviceResponse = {
                statusCode: 200,
                message: 'Regs Dashboard',
                data: [{ _id: 'Asalpha', New: 5, Existing: 10 }],
                res: mockRes
            };
            adminService.regsByMandal.mockResolvedValue(serviceResponse);

            await adminController.mandalDashboard(mockReq, mockRes);

            expect(adminService.regsByMandal).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });

        it('should handle service error response', async () => {
            const serviceResponse = {
                statusCode: 500,
                message: 'Internal Server Error',
                data: '',
                res: mockRes,
                error: new Error('DB Error')
            };
            adminService.regsByMandal.mockResolvedValue(serviceResponse);

            await adminController.mandalDashboard(mockReq, mockRes);

            expect(adminService.regsByMandal).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });

        it('should pass req and res objects to service', async () => {
            adminService.regsByMandal.mockResolvedValue({});

            await adminController.mandalDashboard(mockReq, mockRes);

            expect(adminService.regsByMandal).toHaveBeenCalledWith(mockReq, mockRes);
        });
    });
});

jest.mock('../../services/admin.service.js');
jest.mock('../../utility/responseHelper');

const adminService = require('../../services/admin.service.js');
const responseHelper = require('../../utility/responseHelper');
const adminController = require('../admin.controller');

describe('controllers/admin.controller.js', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = { query: {}, body: {}, params: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    describe('mandalDashboard', () => {
        it('should call adminService.regsByMandal with req and res', async () => {
            const serviceResponse = { statusCode: 200, message: 'Regs Dashboard', data: [], res: mockRes };
            adminService.regsByMandal.mockResolvedValue(serviceResponse);

            await adminController.mandalDashboard(mockReq, mockRes);

            expect(adminService.regsByMandal).toHaveBeenCalledTimes(1);
            expect(adminService.regsByMandal).toHaveBeenCalledWith(mockReq, mockRes);
        });

        it('should pass the service response to responseHelper.sendResponse', async () => {
            const serviceResponse = { statusCode: 200, message: 'Regs Dashboard', data: [{ _id: 'Sabha1', New: 5, Existing: 10 }], res: mockRes };
            adminService.regsByMandal.mockResolvedValue(serviceResponse);

            await adminController.mandalDashboard(mockReq, mockRes);

            expect(responseHelper.sendResponse).toHaveBeenCalledTimes(1);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });

        it('should forward error responses from the service to sendResponse', async () => {
            const errorResponse = { statusCode: 500, message: 'Internal Server Error', data: '', res: mockRes, error: new Error('DB error') };
            adminService.regsByMandal.mockResolvedValue(errorResponse);

            await adminController.mandalDashboard(mockReq, mockRes);

            expect(responseHelper.sendResponse).toHaveBeenCalledWith(errorResponse);
        });

        it('should await the service call before sending response', async () => {
            const callOrder = [];
            adminService.regsByMandal.mockImplementation(async () => {
                callOrder.push('service');
                return { statusCode: 200, message: 'OK', data: [], res: mockRes };
            });
            responseHelper.sendResponse.mockImplementation(() => {
                callOrder.push('response');
            });

            await adminController.mandalDashboard(mockReq, mockRes);

            expect(callOrder).toEqual(['service', 'response']);
        });

        it('should propagate if the service throws an unhandled error', async () => {
            adminService.regsByMandal.mockRejectedValue(new Error('Unexpected crash'));

            await expect(adminController.mandalDashboard(mockReq, mockRes)).rejects.toThrow('Unexpected crash');
        });
    });
});

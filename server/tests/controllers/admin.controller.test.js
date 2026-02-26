jest.mock('../../services/admin.service', () => ({
  regsByMandal: jest.fn()
}));

jest.mock('../../utility/responseHelper', () => ({
  sendResponse: jest.fn()
}));

const adminController = require('../../controllers/admin.controller');
const adminService = require('../../services/admin.service');
const responseHelper = require('../../utility/responseHelper');

describe('adminController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {};
    jest.clearAllMocks();
  });

  describe('mandalDashboard', () => {
    it('should call adminService.regsByMandal and sendResponse', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Regs Dashboard',
        data: [{ _id: 'Asalpha', New: 5, Existing: 10 }]
      };
      adminService.regsByMandal.mockResolvedValue(mockResponse);

      await adminController.mandalDashboard(req, res);

      expect(adminService.regsByMandal).toHaveBeenCalledWith(req, res);
      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });

    it('should pass req and res to the service', async () => {
      adminService.regsByMandal.mockResolvedValue({});

      await adminController.mandalDashboard(req, res);

      expect(adminService.regsByMandal).toHaveBeenCalledWith(req, res);
    });

    it('should handle service error response', async () => {
      const mockResponse = {
        statusCode: 500,
        message: 'Internal Server Error',
        error: new Error('DB Error')
      };
      adminService.regsByMandal.mockResolvedValue(mockResponse);

      await adminController.mandalDashboard(req, res);

      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle empty dashboard data', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Regs Dashboard',
        data: []
      };
      adminService.regsByMandal.mockResolvedValue(mockResponse);

      await adminController.mandalDashboard(req, res);

      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });
  });
});

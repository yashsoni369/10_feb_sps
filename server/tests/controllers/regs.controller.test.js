jest.mock('../../services/regs.service', () => ({
  mobileAutofill: jest.fn(),
  nameAutoFill: jest.fn(),
  formDataFromMobile: jest.fn(),
  register: jest.fn(),
  getAll: jest.fn(),
  getSabhaList: jest.fn(),
  deRegisterMember: jest.fn()
}));

jest.mock('../../utility/responseHelper', () => ({
  sendResponse: jest.fn()
}));

const regsController = require('../../controllers/regs.controller');
const regsService = require('../../services/regs.service');
const responseHelper = require('../../utility/responseHelper');

describe('regsController', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, body: {} };
    res = {};
    jest.clearAllMocks();
  });

  describe('mobileAutofill', () => {
    it('should call regsService.mobileAutofill and sendResponse', async () => {
      const mockResponse = { statusCode: 200, message: 'Mobile autofill', data: [] };
      regsService.mobileAutofill.mockResolvedValue(mockResponse);

      await regsController.mobileAutofill(req, res);

      expect(regsService.mobileAutofill).toHaveBeenCalledWith(req, res);
      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });

    it('should pass error response to sendResponse', async () => {
      const mockResponse = { statusCode: 500, message: 'Internal Server Error', error: new Error('fail') };
      regsService.mobileAutofill.mockResolvedValue(mockResponse);

      await regsController.mobileAutofill(req, res);

      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('nameAutofill', () => {
    it('should call regsService.nameAutoFill and sendResponse', async () => {
      const mockResponse = { statusCode: 200, message: 'Name autofill', data: [] };
      regsService.nameAutoFill.mockResolvedValue(mockResponse);

      await regsController.nameAutofill(req, res);

      expect(regsService.nameAutoFill).toHaveBeenCalledWith(req, res);
      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('formDataFromMobile', () => {
    it('should call regsService.formDataFromMobile and sendResponse', async () => {
      const mockResponse = { statusCode: 200, message: 'Full Details', data: {} };
      regsService.formDataFromMobile.mockResolvedValue(mockResponse);

      await regsController.formDataFromMobile(req, res);

      expect(regsService.formDataFromMobile).toHaveBeenCalledWith(req, res);
      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('register', () => {
    it('should call regsService.register and sendResponse', async () => {
      const mockResponse = { statusCode: 200, message: 'Register Successful', data: {} };
      regsService.register.mockResolvedValue(mockResponse);

      await regsController.register(req, res);

      expect(regsService.register).toHaveBeenCalledWith(req, res);
      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle registration failure', async () => {
      const mockResponse = { statusCode: 400, message: 'Member already Registered' };
      regsService.register.mockResolvedValue(mockResponse);

      await regsController.register(req, res);

      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('getAll', () => {
    it('should call regsService.getAll and sendResponse', async () => {
      const mockResponse = { statusCode: 200, message: 'Registerations List', data: { regs: [], totalRecords: 0 } };
      regsService.getAll.mockResolvedValue(mockResponse);

      await regsController.getAll(req, res);

      expect(regsService.getAll).toHaveBeenCalledWith(req, res);
      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('getSabhaList', () => {
    it('should call regsService.getSabhaList and sendResponse', async () => {
      const mockResponse = { statusCode: 200, message: 'Sabha list', data: ['Asalpha', 'Kurla'] };
      regsService.getSabhaList.mockResolvedValue(mockResponse);

      await regsController.getSabhaList(req, res);

      expect(regsService.getSabhaList).toHaveBeenCalledWith(req, res);
      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('deRegisterMember', () => {
    it('should call regsService.deRegisterMember and sendResponse', async () => {
      const mockResponse = { statusCode: 200, message: 'Member Deleted', data: {} };
      regsService.deRegisterMember.mockResolvedValue(mockResponse);

      await regsController.deRegisterMember(req, res);

      expect(regsService.deRegisterMember).toHaveBeenCalledWith(req, res);
      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle deletion error', async () => {
      const mockResponse = { statusCode: 500, message: 'Internal Server Error', error: new Error('fail') };
      regsService.deRegisterMember.mockResolvedValue(mockResponse);

      await regsController.deRegisterMember(req, res);

      expect(responseHelper.sendResponse).toHaveBeenCalledWith(mockResponse);
    });
  });
});

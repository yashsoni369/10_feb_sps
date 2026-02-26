jest.mock('../services/regs.service', () => ({
    mobileAutofill: jest.fn(),
    nameAutoFill: jest.fn(),
    formDataFromMobile: jest.fn(),
    register: jest.fn(),
    getAll: jest.fn(),
    getSabhaList: jest.fn(),
    deRegisterMember: jest.fn()
}));

jest.mock('../utility/responseHelper', () => ({
    sendResponse: jest.fn()
}));

const regsController = require('./regs.controller');
const regsService = require('../services/regs.service');
const responseHelper = require('../utility/responseHelper');

describe('regsController', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = { query: {}, body: {}, params: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('mobileAutofill', () => {
        it('should call regsService.mobileAutofill and sendResponse', async () => {
            const serviceResponse = { statusCode: 200, message: 'Mobile autofill', data: [], res: mockRes };
            regsService.mobileAutofill.mockResolvedValue(serviceResponse);

            await regsController.mobileAutofill(mockReq, mockRes);

            expect(regsService.mobileAutofill).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });

        it('should pass req and res to service', async () => {
            mockReq.query.mobileNo = '9876543210';
            regsService.mobileAutofill.mockResolvedValue({});

            await regsController.mobileAutofill(mockReq, mockRes);

            expect(regsService.mobileAutofill).toHaveBeenCalledWith(mockReq, mockRes);
        });
    });

    describe('nameAutofill', () => {
        it('should call regsService.nameAutoFill and sendResponse', async () => {
            const serviceResponse = { statusCode: 200, message: 'Name autofill', data: [], res: mockRes };
            regsService.nameAutoFill.mockResolvedValue(serviceResponse);

            await regsController.nameAutofill(mockReq, mockRes);

            expect(regsService.nameAutoFill).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });
    });

    describe('formDataFromMobile', () => {
        it('should call regsService.formDataFromMobile and sendResponse', async () => {
            const serviceResponse = { statusCode: 200, message: 'Full Details', data: {}, res: mockRes };
            regsService.formDataFromMobile.mockResolvedValue(serviceResponse);

            await regsController.formDataFromMobile(mockReq, mockRes);

            expect(regsService.formDataFromMobile).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });
    });

    describe('register', () => {
        it('should call regsService.register and sendResponse', async () => {
            const serviceResponse = { statusCode: 200, message: 'Register Successful', data: {}, res: mockRes };
            regsService.register.mockResolvedValue(serviceResponse);

            await regsController.register(mockReq, mockRes);

            expect(regsService.register).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });
    });

    describe('getAll', () => {
        it('should call regsService.getAll and sendResponse', async () => {
            const serviceResponse = { statusCode: 200, message: 'Registerations List', data: { regs: [], totalRecords: 0 }, res: mockRes };
            regsService.getAll.mockResolvedValue(serviceResponse);

            await regsController.getAll(mockReq, mockRes);

            expect(regsService.getAll).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });
    });

    describe('getSabhaList', () => {
        it('should call regsService.getSabhaList and sendResponse', async () => {
            const serviceResponse = { statusCode: 200, message: 'Sabha list', data: [], res: mockRes };
            regsService.getSabhaList.mockResolvedValue(serviceResponse);

            await regsController.getSabhaList(mockReq, mockRes);

            expect(regsService.getSabhaList).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });
    });

    describe('deRegisterMember', () => {
        it('should call regsService.deRegisterMember and sendResponse', async () => {
            const serviceResponse = { statusCode: 200, message: 'Member Deleted', data: {}, res: mockRes };
            regsService.deRegisterMember.mockResolvedValue(serviceResponse);

            await regsController.deRegisterMember(mockReq, mockRes);

            expect(regsService.deRegisterMember).toHaveBeenCalledWith(mockReq, mockRes);
            expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
        });
    });
});

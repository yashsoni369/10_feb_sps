jest.mock('../../services/regs.service');
jest.mock('../../utility/responseHelper');

const regsService = require('../../services/regs.service');
const responseHelper = require('../../utility/responseHelper');
const regsController = require('../regs.controller');

describe('controllers/regs.controller.js', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = { query: {}, body: {}, params: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    /**
     * Helper to generate standard tests for each controller method.
     * Each controller method follows the same pattern:
     *   1. Call the corresponding service method with (req, res)
     *   2. Pass the result to responseHelper.sendResponse
     */
    function describeControllerMethod(methodName, serviceMethodName) {
        describe(methodName, () => {
            it(`should call regsService.${serviceMethodName} with req and res`, async () => {
                const serviceResponse = { statusCode: 200, message: 'OK', data: [], res: mockRes };
                regsService[serviceMethodName].mockResolvedValue(serviceResponse);

                await regsController[methodName](mockReq, mockRes);

                expect(regsService[serviceMethodName]).toHaveBeenCalledTimes(1);
                expect(regsService[serviceMethodName]).toHaveBeenCalledWith(mockReq, mockRes);
            });

            it('should pass the service response to responseHelper.sendResponse', async () => {
                const serviceResponse = { statusCode: 200, message: 'Success', data: { id: 1 }, res: mockRes };
                regsService[serviceMethodName].mockResolvedValue(serviceResponse);

                await regsController[methodName](mockReq, mockRes);

                expect(responseHelper.sendResponse).toHaveBeenCalledTimes(1);
                expect(responseHelper.sendResponse).toHaveBeenCalledWith(serviceResponse);
            });

            it('should forward error responses from the service to sendResponse', async () => {
                const errorResponse = { statusCode: 500, message: 'Internal Server Error', data: '', res: mockRes, error: new Error('DB error') };
                regsService[serviceMethodName].mockResolvedValue(errorResponse);

                await regsController[methodName](mockReq, mockRes);

                expect(responseHelper.sendResponse).toHaveBeenCalledWith(errorResponse);
            });

            it('should await the service call before sending response', async () => {
                const callOrder = [];
                regsService[serviceMethodName].mockImplementation(async () => {
                    callOrder.push('service');
                    return { statusCode: 200, message: 'OK', data: [], res: mockRes };
                });
                responseHelper.sendResponse.mockImplementation(() => {
                    callOrder.push('response');
                });

                await regsController[methodName](mockReq, mockRes);

                expect(callOrder).toEqual(['service', 'response']);
            });

            it('should propagate if the service throws an unhandled error', async () => {
                regsService[serviceMethodName].mockRejectedValue(new Error('Unexpected crash'));

                await expect(regsController[methodName](mockReq, mockRes)).rejects.toThrow('Unexpected crash');
            });
        });
    }

    // Test all 7 controller methods mapped to their service counterparts
    describeControllerMethod('mobileAutofill', 'mobileAutofill');
    describeControllerMethod('nameAutofill', 'nameAutoFill');
    describeControllerMethod('formDataFromMobile', 'formDataFromMobile');
    describeControllerMethod('register', 'register');
    describeControllerMethod('getAll', 'getAll');
    describeControllerMethod('getSabhaList', 'getSabhaList');
    describeControllerMethod('deRegisterMember', 'deRegisterMember');
});

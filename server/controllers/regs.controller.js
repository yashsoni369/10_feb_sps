const regsService = require('../services/regs.service');
const responseHelper = require('../utility/responseHelper');

const regsController = {};

regsController.mobileAutofill = async (req, res) => {
    var response = await regsService.mobileAutofill(req, res);
    responseHelper.sendResponse(response)
}

regsController.nameAutofill = async (req, res) => {
    var response = await regsService.nameAutoFill(req, res);
    responseHelper.sendResponse(response)
}

regsController.formDataFromMobile = async (req, res) => {
    var response = await regsService.formDataFromMobile(req, res);
    responseHelper.sendResponse(response)
}

regsController.register = async (req, res) => {
    var response = await regsService.register(req, res);
    responseHelper.sendResponse(response)
}

regsController.getAll = async (req, res) => {
    var response = await regsService.getAll(req, res);
    responseHelper.sendResponse(response)
}

regsController.getSabhaList = async (req, res) => {
    var response = await regsService.getSabhaList(req, res);
    responseHelper.sendResponse(response)
}

regsController.deRegisterMember = async (req, res) => {
    var response = await regsService.deRegisterMember(req, res);
    responseHelper.sendResponse(response)
}

module.exports = regsController;
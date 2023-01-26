const adminService = require('../services/admin.service.js');
const responseHelper = require('../utility/responseHelper');

const adminController = {};


adminController.mandalDashboard = async (req, res) => {
    var response = await adminService.regsByMandal(req, res);
    responseHelper.sendResponse(response)
}


module.exports = adminController;
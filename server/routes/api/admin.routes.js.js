const adminController = require('../../controllers/admin.controller.js');

module.exports = router => {
    router.get('/dashboard/mandalWise', adminController.mandalDashboard);
}
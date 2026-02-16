const stockController = require('../../controllers/stock.controller');

module.exports = function(router) {
    // Get NVIDIA stock data for last week
    router.get('/stock/nvidia', stockController.getNvidiaStockData);

    // Get NVIDIA stock chart as image
    router.get('/stock/nvidia/chart', stockController.getNvidiaStockChart);
};

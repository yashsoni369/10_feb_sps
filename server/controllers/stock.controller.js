const stockService = require('../services/stock.service');
const logger = require('../utility/logger');

class StockController {
    async getNvidiaStockData(req, res) {
        try {
            logger.logger.info('Fetching NVIDIA stock data');
            const stockData = await stockService.getNvidiaStockData();

            res.status(200).json({
                success: true,
                data: stockData,
                message: 'NVIDIA stock data fetched successfully'
            });
        } catch (error) {
            logger.logger.error('Error fetching NVIDIA stock data:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching stock data',
                error: error.message
            });
        }
    }

    async getNvidiaStockChart(req, res) {
        try {
            logger.logger.info('Generating NVIDIA stock chart');
            const stockData = await stockService.getNvidiaStockData();
            const chartBuffer = await stockService.generateChartImage(stockData);

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', 'inline; filename="nvidia-stock-chart.png"');
            res.send(chartBuffer);
        } catch (error) {
            logger.logger.error('Error generating NVIDIA stock chart:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating stock chart',
                error: error.message
            });
        }
    }
}

module.exports = new StockController();

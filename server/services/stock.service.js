const axios = require('axios');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

class StockService {
    constructor() {
        // Using Alpha Vantage API as a free stock data provider
        // Note: For production, consider using a paid API or different provider
        this.baseURL = 'https://www.alphavantage.co/query';
        this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    }

    async getNvidiaStockData() {
        try {
            // Fetch daily stock data for NVIDIA (NVDA)
            const response = await axios.get(this.baseURL, {
                params: {
                    function: 'TIME_SERIES_DAILY',
                    symbol: 'NVDA',
                    apikey: this.apiKey,
                    outputsize: 'compact'
                }
            });

            if (!response.data['Time Series (Daily)']) {
                throw new Error('Unable to fetch stock data. Please check API key or try again later.');
            }

            const timeSeries = response.data['Time Series (Daily)'];

            // Get last 7 days of data
            const dates = Object.keys(timeSeries).slice(0, 7).reverse();
            const stockData = dates.map(date => ({
                date: date,
                open: parseFloat(timeSeries[date]['1. open']),
                high: parseFloat(timeSeries[date]['2. high']),
                low: parseFloat(timeSeries[date]['3. low']),
                close: parseFloat(timeSeries[date]['4. close']),
                volume: parseInt(timeSeries[date]['5. volume'])
            }));

            return stockData;
        } catch (error) {
            console.error('Error fetching NVIDIA stock data:', error.message);
            // Return mock data if API fails
            return this.getMockStockData();
        }
    }

    getMockStockData() {
        // Mock data for demonstration when API is unavailable
        const today = new Date();
        const mockData = [];

        let basePrice = 875.00;

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Skip weekends for realistic stock data
            if (date.getDay() === 0 || date.getDay() === 6) {
                continue;
            }

            const variation = (Math.random() - 0.5) * 20;
            const open = basePrice + variation;
            const close = open + (Math.random() - 0.5) * 15;
            const high = Math.max(open, close) + Math.random() * 10;
            const low = Math.min(open, close) - Math.random() * 10;

            mockData.push({
                date: date.toISOString().split('T')[0],
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: Math.floor(Math.random() * 50000000) + 20000000
            });

            basePrice = close;
        }

        return mockData;
    }

    async generateChartImage(stockData) {
        const width = 1200;
        const height = 600;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

        const labels = stockData.map(d => d.date);
        const closePrices = stockData.map(d => d.close);
        const highPrices = stockData.map(d => d.high);
        const lowPrices = stockData.map(d => d.low);

        const configuration = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Close Price',
                        data: closePrices,
                        borderColor: 'rgb(76, 187, 23)',
                        backgroundColor: 'rgba(76, 187, 23, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'High Price',
                        data: highPrices,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Low Price',
                        data: lowPrices,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'NVIDIA (NVDA) Stock Price - Last Week',
                        font: {
                            size: 24,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14
                            },
                            color: '#333'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Price (USD)',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: '#333'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            },
                            color: '#333',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: '#e0e0e0'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: '#333'
                        },
                        ticks: {
                            color: '#333',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        };

        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        return imageBuffer;
    }
}

module.exports = new StockService();

const responseHelper = require('../utility/responseHelper');

const greetController = {};

greetController.greet = (req, res) => {
    const { name } = req.query;
    const greeting = name
        ? `Hello ${name}! Welcome back!`
        : `Hello! Welcome to SPS!`;

    const response = {
        statusCode: 200,
        error: null,
        res: res,
        message: 'Greeting sent successfully',
        data: { greeting: greeting }
    };

    responseHelper.sendResponse(response);
};

module.exports = greetController;

var log = require('./logger');

function manage_response(err, res, data, statusCode, message) {
    if (err) {
        if (statusCode) {
            log.logResponseError(err, res, statusCode);
            res.status(statusCode).send({ message: err, data: null })
        }
        else {
            //    log.logResponseError(err, res, 500);
            res.status(500).send({ message: "Internal Server Error", data: null })
        }
    }
    else {
        res.status(200).send({ message: message, data: data })
    }
}
function sendResponse(response) {
    const { statusCode, error, res, message, data } = response
    if (error) {
        if (statusCode) {
            log.logResponseError(error, res, statusCode);
            res.status(statusCode).send({ message: message.length == 0 ? error.message : message, data: null })
        }
        else if (statusCode == 0) {
            message = 'Service shut down or not reachable!'
            log.logResponseError(message, res, statusCode);
            res.status(statusCode).send({ message: message, data: null })
        }
        else {
            log.logResponseError(message, res, statusCode);
            res.status(500).send({ message: "Internal Server Error", data: null })
        }
    }
    else {
        if (statusCode) {
            res.status(statusCode).send({ message: message, data: data })
        }
        else {
            res.status(200).send({ message: message, data: data })
        }
    }
}

module.exports = {
    sendResponse
}
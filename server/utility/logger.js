var log4js = require('log4js');
var path = require('path');

log4js.configure({
    appenders: {
        authlog: { type: 'dateFile', filename: path.join(__dirname, "../logs/logger"), layout: { type: 'pattern', pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m' }, pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true, },
        console: { type: 'console' }
    },
    categories: {
        // cheese: { appenders: ['cheeseLogs'], level: 'error' },
        // another: { appenders: ['console'], level: 'trace' },
        default: { appenders: ['console', 'authlog'], level: 'trace' },
        DEV: { appenders: ['console', 'authlog'], level: 'all' },
        PROD: { appenders: ['console', 'authlog'], level: 'warn' }
    }
});
const log = log4js.getLogger('DEV')
module.exports = {
    logger: log,
    logRequest: function (req, res, next) {
        log.info(`Accessed Server's URL [${req.hostname}:${req.socket.localPort}${req.originalUrl}] on [${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}]`);
        next();
    },
    logResponseError: function (err, res, statusCode) {
        log.error(`Error in response of URL [${res.req.hostname}:${res.req.socket.localPort}${res.req.originalUrl}], with message : - ${err} and HTTPStatusCode : - ${statusCode}`);
    }
}
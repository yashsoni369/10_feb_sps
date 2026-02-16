const { Router } = require('express')
const apiRouter = new Router();

const setupSSLRoutes = require('./regs.routes')
const setupAdmin = require('./admin.routes.js')
const setupStock = require('./stock.routes')


setupSSLRoutes(apiRouter);
setupAdmin(apiRouter);
setupStock(apiRouter);


module.exports = apiRouter
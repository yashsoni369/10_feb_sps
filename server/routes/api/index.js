const { Router } = require('express')
const apiRouter = new Router();

const setupSSLRoutes = require('./regs.routes')
const setupAdmin = require('./admin.routes.js')


setupSSLRoutes(apiRouter);
setupAdmin(apiRouter);


module.exports = apiRouter
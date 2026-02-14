const { Router } = require('express')
const apiRouter = new Router();

const setupSSLRoutes = require('./regs.routes')
const setupAdmin = require('./admin.routes.js')
const setupGreet = require('./greet.routes')


setupSSLRoutes(apiRouter);
setupAdmin(apiRouter);
setupGreet(apiRouter);


module.exports = apiRouter
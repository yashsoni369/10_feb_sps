const express = require('express');

require('dotenv').config()

const bodyParser = require("body-parser");
const cors = require("cors");
const initRoutes = require('./routes');
require('./config/db.mongo');
const logger = require('./utility/logger');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(logger.logRequest)

// openConnection()

initRoutes(app);

app.listen(port, () => {
    console.log(`[server]: SPS Backend is running at http://localhost:${port}`);
});
// server.js
require('dotenv').config() //needed for local development
var app = require('./app');
const serverless    = require('serverless-http')
module.exports.run = serverless(app);

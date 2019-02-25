// server.js
require('dotenv').config() //needed for local development
var app = require('./app');
var port = process.env.PORT || 3000;
var server = app.listen(port, () =>
  console.log('Express server listening on port ' + port)
);

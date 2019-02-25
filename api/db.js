// db.js
var mongoose = require('mongoose');
//Preparing to get rid of DSN string
let dsn = process.env.MONGO;
mongoose.connect(dsn, { useNewUrlParser: true });

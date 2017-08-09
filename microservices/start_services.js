require('dotenv').config({path: __dirname + '/../.env'});

var process_manager = require('./process.js');

process_manager.start();

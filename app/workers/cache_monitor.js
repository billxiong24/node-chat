require('dotenv').config({path: '../../.env'});
var message_cache_monitor = require('./message_cache_monitor.js');
const cache_functions = require('../cache/cache_functions.js');

//run as separate process
message_cache_monitor();

//flush inactive jobs stuck in queue
cache_functions.processQueue.monitorStuck();

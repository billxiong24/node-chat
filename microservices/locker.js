require('dotenv').config({path: __dirname + '/../.env'});
var redis = require("redis");
var Redlock = require('redlock');

var clients = [];
for(var i = 6379; i < 6383; i++) {
    clients.push(redis.createClient(i, process.env.HOST));
}

var redlock = new Redlock(
    clients,
    {
        driftFactor: process.env.LOCK_DRIFT_FACTOR,
        retryCount: process.env.LOCK_RETRY_COUNT,
        retryDelay: process.env.LOCK_RETRY_DELAY,
        retryJitter: process.env.LOCK_RETRY_JITTER
    }
);

module.exports = redlock;

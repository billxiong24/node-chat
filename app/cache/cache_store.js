const redis = require('redis');
var port = process.env.REDIS_PORT || 6379;
var host = process.env.HOST;

module.exports = redis.createClient(port, host);

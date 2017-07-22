var bluebird = require('bluebird');
var redis;

if(process.env.NODE_ENV === 'test') {
    redis = require('fakeredis');
}
else {
    redis = require('redis');
}

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var port = process.env.REDIS_PORT || 6379;
var host = process.env.HOST;

module.exports = redis.createClient(port, host);

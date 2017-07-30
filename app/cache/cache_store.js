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

//TODO data sharding with these ports
var ports = [6379, 6380, 6381, 6382];

var port = process.env.REDIS_PORT || 6379;
var host = process.env.HOST;

module.exports = redis.createClient(port, host);

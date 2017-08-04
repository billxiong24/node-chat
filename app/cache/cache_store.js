var bluebird = require('bluebird');
var redis;

redis = require('ioredis');

//bluebird.promisifyAll(redis.RedisClient.prototype);
//bluebird.promisifyAll(redis.Multi.prototype);

var host = process.env.HOST;

var port = process.env.REDIS_PORT || 6379;
var host = process.env.HOST;

//couldn't find a proper mock for ioredis
var client; 
if(process.env.NODE_ENV === 'test') {
    client = new redis(6666, host);
    client.flushall();
}
else {
 client = new redis(port, host);
}
module.exports = process.env.NODE_ENV === 'test' ? new redis(6666, host) : new redis(port, host);

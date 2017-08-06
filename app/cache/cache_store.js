//TODO Look into issue: Asynchronous AOF fsync is taking too long (disk is busy?). Writing the AOF buffer without
//waiting for fsync to complete, this may slow down Redis.
var bluebird = require('bluebird');
var redis;

redis = require('ioredis');

//bluebird.promisifyAll(redis.RedisClient.prototype);
//bluebird.promisifyAll(redis.Multi.prototype);

var host = process.env.HOST;

var port = process.env.REDIS_PORT || 6379;
var host = process.env.HOST;

//couldn't find a proper mock for ioredis
var client = new redis.Cluster([
    {
        port: 6379,
        host: host
    },
    {
        port: 6380,
        host: host
    },
    {
        port: 6381,
        host: host
    }

], {
    scaleReads: 'slave',
    enableOfflineQueue: true
});

module.exports = client;

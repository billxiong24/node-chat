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

var host = process.env.HOST;
//TODO data sharding with these ports
var ports = [6379, 6380, 6381];
var clients = [];

for (var i = 0, l = ports.length; i < l; i++) {
    clients.push(redis.createClient(ports[i], host));
}

var port = process.env.REDIS_PORT || 6379;
var host = process.env.HOST;

module.exports = clients;

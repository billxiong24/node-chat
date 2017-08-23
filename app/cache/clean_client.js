//var redis = require('ioredis');
var redis = require('redis');
var redis_options = require('./cache_config.js');

//if(process.env.NODE_ENV === 'test') {
    //redis = require('fakeredis');
//}

var CleanClient = function() {
    this._clients = [];
};

CleanClient.prototype.genClient = function() {
    var that = this;
    return function() {
        var client = redis.createClient({
            host: process.env.HOST,
            port: 6379 
        });
        that._clients.push(client);
        return client;
    };
};

CleanClient.prototype.cleanup = function() {
    for(var i = 0; i < this._clients.length; i++)  {
        this._clients[i].quit();
    }
};

module.exports = CleanClient;

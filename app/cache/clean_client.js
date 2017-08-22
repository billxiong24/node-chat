//var redis = require('ioredis');
var redis = require('redis');
var redis_options = require('./cache_config.js');

//if(process.env.NODE_ENV === 'test') {
    //redis = require('fakeredis');
//}

var host = process.env.HOST;
function genClient(clients) {
    return function() {
        var client = redis.createClient({
            host: process.env.HOST,
            port: 6379 
        });
        clients.push(client);
        return client;
    };
}

function cleanup(clients) {
    for(var i = 0; i < clients.length; i++)  {
        clients[i].quit();
    }
}

module.exports = {
    genClient: genClient,
    cleanup: cleanup
};

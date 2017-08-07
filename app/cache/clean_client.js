var redis = require('redis');

function genClient(clients) {
    return function() {
        var client = redis.createClient();
        clients.push(client);
        return client;
    };
}

function cleanup(clients) {
    for(var i = 0; i < clients.length; i++)  {
        clients[i].end(true);
    }
}

module.exports = {
    genClient: genClient,
    cleanup: cleanup
};

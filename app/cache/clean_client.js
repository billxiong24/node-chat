var redis = require('redis');

//if(process.env.NODE_ENV === 'test') {
    //redis = require('fakeredis');
//}

var host = process.env.HOST;
function genClient(clients) {
    return function() {
        var client = redis.createClient();
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

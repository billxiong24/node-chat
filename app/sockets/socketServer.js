var TypingSocket = require('./typingSocket.js');
var NotifSocket = require('./notifSocket.js');
var ChatSocket = require('./chatSocket.js');
var VoteSocket = require('./voteSocket.js');
var FileSocket = require('./fileSocket.js');
var Socket = require('./socket.js');
var socketio_redis = require('socket.io-redis');

//var socketio_redis = require('socket.io-ioredis');
var Redis = require('ioredis');
var redis_options = require('../cache/cache_config.js');

module.exports = function(http, sessionMiddleWare) {
    var io = require('socket.io')(http);
    /*
     * Using the socket.io-redis Adapter will allow
     * sockets to communicate across multiple
     * processes (listening on different ports). Combined with
     * redis store, this helps with scalability issues
     */

    var client1 = new Redis.Cluster(redis_options.clusters, redis_options.options);
    var client2 = new Redis.Cluster(redis_options.clusters, redis_options.options);
    io.adapter(socketio_redis({
        pubClient: client1,
        subClient: client2
    }));

    io.use(function(socket, next) {
        sessionMiddleWare(socket.request, socket.request.res, next);
    });

    var typingSocketObj = new TypingSocket(io, '/typing');
    typingSocketObj.init();

    var notifSocketObj = new NotifSocket(io, '/notifications');
    notifSocketObj.init();

    var chatSocketObj = new ChatSocket(io);
    chatSocketObj.init();

    var voteSocketObj = new VoteSocket(io, '/vote');
    voteSocketObj.init();

    var fileSocketObj = new FileSocket(io, '/file');
    fileSocketObj.init();

    return io;
};

var TypingSocket = require('./typingSocket.js');
var NotifSocket = require('./notifSocket.js');
var ChatSocket = require('./chatSocket.js');
var VoteSocket = require('./voteSocket.js');
var Socket = require('./socket.js');
var socketio_redis = require('socket.io-redis');

module.exports = function(http, sessionMiddleWare) {
    var io = require('socket.io')(http);
    /*
     * Using the socket.io-redis Adapter will allow
     * sockets to communicate across multiple
     * processes (listening on different ports). Combined with
     * redis store, this helps with scalability issues
     */
    io.adapter(socketio_redis({host: process.env.HOST, port: 6379}));

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



    return io;
};

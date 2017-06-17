var TypingSocket = require('./typingSocket.js');
var NotifSocket = require('./notifSocket.js');
var ChatSocket = require('./chatSocket.js');
var Socket = require('./socket.js');

module.exports = function(http, sessionMiddleWare) {
    var io = require('socket.io')(http);

    //force sockets to use websocket protocol and not polling
    //will help with node clustering later
    //io.set('transports', ['websockets']);
    //io.set('upgrade', false);
    //io.set('force new connection', true);

    io.use(function(socket, next) {
        sessionMiddleWare(socket.request, socket.request.res, next);
    });

    var typingSocketObj = new TypingSocket(io, '/typing');
    typingSocketObj.init();

    var notifSocketObj = new NotifSocket(io, '/notifications');
    notifSocketObj.init();

    var chatSocketObj = new ChatSocket(io);
    chatSocketObj.init();
};

var Socket = require('./socket.js');
const urlParser = require('url');

var VoteSocket = function(io, namespace=null) {
    Socket.call(this, io, namespace);
};

VoteSocket.prototype = Object.create(Socket.prototype);
VoteSocket.prototype.constructor = VoteSocket;

VoteSocket.prototype.init = function() {
    var that = this;

    this.addOnConnectionListener(function(socket) {
        socket = Socket.prototype.addJoinLeaveListener.call(that, socket);
    });

    socket.on('vote', function(data) {
        var chat_id = Socket.prototype.parseID.call(that, socket.handshake.headers.referer);
        
        
        Socket.prototype.getIO.call(that).to(chat_id).emit('vote', data);
        //TODO update vote value in redis
    });
    
};

module.exports = VoteSocket;

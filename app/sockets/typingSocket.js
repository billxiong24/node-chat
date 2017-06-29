var Socket = require('./socket.js');

var TypingSocket = function(io, namespace) {
    Socket.call(this, io, namespace);

};

TypingSocket.prototype = Object.create(Socket.prototype);
TypingSocket.prototype.constructor = TypingSocket;

Socket.prototype.init = function() {
    var that = this;

    this.addOnConnectionListener(function(socket) {
        socket = Socket.prototype.addJoinLeaveListener.call(that, socket); 
        socket.on('typing', function(data) {
            Socket.prototype.getIO.call(that).to(data.roomID).emit('typing', data);
        });    
    });
};


module.exports = TypingSocket;

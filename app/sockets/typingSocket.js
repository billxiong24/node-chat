var Socket = require('./socket.js');

var TypingSocket = function(io, namespace) {
    Socket.call(this, io, namespace);

    this.init = function() {
        var that = this;

        this.addOnConnectionListener(function(socket) {
            socket = that.addJoinLeaveListener(socket); 
            socket.on('typing', function(data) {
                that.getIO().to(data.roomID).emit('typing', data);
            });    
        });
    };
};

TypingSocket.prototype = Socket.prototype;
TypingSocket.prototype.constructor = TypingSocket;

module.exports = TypingSocket;

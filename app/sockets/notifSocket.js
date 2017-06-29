var Socket = require('./socket.js');

var NotifSocket = function(io, namespace) {
    Socket.call(this, io, namespace);

};

NotifSocket.prototype = Object.create(Socket.prototype);
NotifSocket.prototype.constructor = NotifSocket;

NotifSocket.prototype.init = function() {
    var that = this;

    this.addOnConnectionListener(function(socket) {
        socket = Socket.prototype.addJoinLeaveListener.call(that, socket); 

        socket.on('notify', function(data) {
            socket.broadcast.to(data.roomID).emit('notify', data);
        });

        socket.on('disconnect', function(data) { 
        });
    });
};


module.exports = NotifSocket;

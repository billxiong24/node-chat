var Socket = require('./socket.js');

var NotifSocket = function(io, namespace) {
    Socket.call(this, io, namespace);

    this.init = function() {
        var that = this;

        this.addOnConnectionListener(function(socket) {
            socket = that.addJoinLeaveListener(socket); 

            socket.on('notify', function(data) {
                socket.broadcast.to(data.roomID).emit('notify', data);
            });

            socket.on('disconnect', function(data) { 
            });
        });
    };
};

NotifSocket.prototype = Socket.prototype;
NotifSocket.prototype.constructor = NotifSocket;

module.exports = NotifSocket;

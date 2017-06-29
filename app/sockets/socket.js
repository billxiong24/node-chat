var Socket = function(io, namespace=null) {
    this._io = (namespace === null) ? io : io.of(namespace);
};

Socket.prototype.getIO = function() {
    return this._io;
};

Socket.prototype.addJoinLeaveListener = function(socket) {
    socket.on('join', function(data) {
        socket.join(data.room);
    });

    socket.on('leave', function(data) {
        socket.leave(data.room);
    });

    return socket;
};

Socket.prototype.addOnConnectionListener = function(connectionCallBack) {
    this._io.on('connection', connectionCallBack);
};

//override method, "abstract method"
Socket.prototype.init = function() {};

module.exports = Socket;

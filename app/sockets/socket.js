var Socket = function(io, namespace=null) {
    this._io = (namespace === null) ? io : io.of(namespace);


    this.getIO = function() {
        return this._io;
    };

    this.addJoinLeaveListener = function(socket) {
        socket.on('join', function(data) {
            socket.join(data.room);
        });

        socket.on('leave', function(data) {
            socket.leave(data.room);
        });

        return socket;
    };

    this.addOnConnectionListener = function(connectionCallBack) {
        this._io.on('connection', connectionCallBack);
    };

    //override method, "abstract method"
    this.init = function() {};


};

module.exports = Socket;

var logger = require('../../util/logger.js');
const urlParser = require('url');

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
    this._io.on('connection', function(socket) {
        connectionCallBack(socket);
    });
};

Socket.prototype.parseID = function(referer) {
    var url = urlParser.parse(referer);
    var pathname = url.pathname;

    var str;
    if(pathname.charAt(pathname.length - 1) === '/') {
        pathname = pathname.substring(0, pathname.length - 1);
        str = pathname.substring(pathname.lastIndexOf("/") + 1);
    }
    else {
        str = pathname.substring(pathname.lastIndexOf("/") + 1);
    }
    return str;
};

//override method, "abstract method"
Socket.prototype.init = function() {};

module.exports = Socket;

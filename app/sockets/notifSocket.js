var Socket = require('./socket.js');
//const NotifCache = require('../models/notif_cache.js');

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

        //socket.on('cacheNotifications', function(data) {
            //TODO add this data to cache- contains {userid, notif, roomID}
            //var notifcache = new NotifCache(data.roomID, data.userid, data.notif);
            //notifcache.write();

        //});

        socket.on('disconnect', function(data) { 
        });
    });
};


module.exports = NotifSocket;

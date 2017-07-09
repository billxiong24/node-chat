const urlParser = require('url');
const crypto = require('crypto');
//const Line = require('../models/line.js');
const LineCache = require('../models/line_cache.js');
const Notification = require('../models/notification.js');
const session_handler = require('../session/session_handler.js');

var Socket = require('./socket.js');

var ChatSocket = function(io, namespace) {
    Socket.call(this, io, namespace);

    //lazy instantiation
    this._url = null;
    this._id = null;
};

ChatSocket.prototype = Object.create(Socket.prototype);
ChatSocket.prototype.constructor = ChatSocket;

//override
ChatSocket.prototype.init = function() {
    var that = this;
    this.addOnConnectionListener(function(socket) {
        socket = Socket.prototype.addJoinLeaveListener.call(that, socket);

        socket.on('connected', function(data) {
            var url = urlParser.parse(socket.handshake.headers.referer);
            var id = parseID(url.pathname);

            Socket.prototype.getIO.call(that).to(id).emit('connected', {
                notifs: socket.request.session.members[id].notifs,
                user: socket.request.session.user
            });
        });

        socket.on('online', function(data) {
            var url = urlParser.parse(socket.handshake.headers.referer);
            var id = parseID(url.pathname);
            Socket.prototype.getIO.call(that).to(id).emit('online', {
                user: socket.request.session.user,
                notifs: socket.request.session.members[id].notifs,
                //for use case when stupid user opens multiple tabs of same chat
                term: data.term,
                socketID: socket.id
            });
        });

        socket.on('message', function(message) {
            //console.log(socket.handshake.headers);
            var url = urlParser.parse(socket.handshake.headers.referer);

            var message_info = {
                message : message, 
                username: socket.request.session.user.username,
                /* cookie set should be same as userid */
                cookie: socket.request.session.user.id
            };

            var id = parseID(url.pathname);

            Socket.prototype.getIO.call(that).to(id).emit('message', message_info);

            //violates open close principle
            var line = new LineCache(id, socket.request.session.user.username, message, crypto.randomBytes(24).toString('hex'));
            line.insert();
            //TODO find a way to cache this
            var notif = new Notification(id, socket.request.session.user.username, -1);
            notif.flush();
        });

        socket.on('disconnect', function(data) {
            var url = urlParser.parse(socket.handshake.headers.referer);
            var id = parseID(url.pathname);
            console.log(socket.id);
            Socket.prototype.getIO.call(that).to(id).emit('disconnected', {
                socketID: socket.id,
                user: socket.request.session.user
            });
        });
    });
    
};

function parseID(pathname) {
    var str;
    if(pathname.charAt(pathname.length - 1) === '/') {
        pathname = pathname.substring(0, pathname.length - 1);
        str = pathname.substring(pathname.lastIndexOf("/") + 1);
    }
    else {
        str = pathname.substring(pathname.lastIndexOf("/") + 1);
    }
    return str;
}

module.exports = ChatSocket;

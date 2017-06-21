const urlParser = require('url');
const crypto = require('crypto');
const Line = require('../models/line.js');
const session_handler = require('../session/session_handler.js');

var Socket = require('./socket.js');

var ChatSocket = function(io, namespace) {
    Socket.call(this, io, namespace);

    //lazy instantiation
    this.url = null;
    this.id = null;
    this.room = null;

    this.init = function() {
        var that = this;
        this.addOnConnectionListener(function(socket) {
            socket = that.addJoinLeaveListener(socket);

            socket.on('connected', function(data) {
                var url = urlParser.parse(socket.handshake.headers.referer);
                var id = parseID(url.pathname);
                var room = io.sockets.adapter.rooms[id];
                console.log(socket.request);

                //session_handler.handleSession(function(session) {
                    //room.sockets[socket.id] = {
                        //username: session.user.username,
                        //userid: session.user.id
                    //};

                    //that.getIO().to(id).emit('connected', {
                        //notifs: session.members[id].notifs,
                        //user: session.user, 
                        //room: room
                    //});
                //});
                room.sockets[socket.id] = {
                    username: socket.request.session.user.username,
                    userid: socket.request.session.user.id
                };

                that.getIO().to(id).emit('connected', {
                    notifs: socket.request.session.members[id].notifs,
                    user: socket.request.session.user, 
                    room: room
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
                //console.log(io.sockets.clients(id));

                io.to(id).emit('message', message_info);

                var line = new Line(id, socket.request.session.user.username, message, crypto.randomBytes(24).toString('hex'));

                line.insert();
            });

            socket.on('disconnect', function(data) {
                var url = urlParser.parse(socket.handshake.headers.referer);
                var id = parseID(url.pathname);
                var room = io.sockets.adapter.rooms[id];
                io.to(id).emit('disconnected', {user: socket.request.session.user, room: room});
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
};
ChatSocket.prototype = Socket.prototype;
ChatSocket.prototype.constructor = ChatSocket;

module.exports = ChatSocket;

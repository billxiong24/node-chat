var logger = require('../../util/logger.js')(module);
const urlParser = require('url');
const crypto = require('crypto');
//const Line = require('../models/line.js');
const LineCache = require('../models/line_cache.js');
const Notification = require('../models/notification.js');
const NotificationManager = require('../chat_functions/notif_manager.js');
const NotifRequest = require('../../microservices/notifs/notif_request.js');

const CleanClient = require('../cache/clean_client.js');

var ChatSearchManager = require('../search/chat_search_manager.js');

var Socket = require('./socket.js');

var ChatSocket = function(io, namespace) {
    Socket.call(this, io, namespace);

    //lazy instantiation
    this._url = null;
    this._id = null;
    this._userSockets = {};
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

            that._userSockets[socket.request.session.user.id] = data.socketID;
            Socket.prototype.getIO.call(that).to(id).emit('online', {
                user: socket.request.session.user,
                notifs: socket.request.session.members[id].notifs,
                //for use case when stupid user opens multiple tabs of same chat
                term: data.term,
                socketID: data.socketID,
                nativeSocketID: socket.id
            });
        });

        socket.on('message', function(message) {
            var url = urlParser.parse(socket.handshake.headers.referer);

            var line_id = crypto.randomBytes(24).toString('hex');

            var message_info = {
                message : message, 
                username: socket.request.session.user.username,
                first: socket.request.session.user.first,
                last: socket.request.session.user.last,
                /* cookie set should be same as userid */
                cookie: socket.request.session.user.id,
                line_id: line_id
            };

            var id = parseID(url.pathname);
            Socket.prototype.getIO.call(that).to(id).emit('message', message_info);

            //FIXME violates open close principle
            var line = new LineCache(id, socket.request.session.user.username, message, line_id);
            line.insert(function(err, result) {
                new ChatSearchManager().incrementField(id, 'num_messages', 1, function(err, res) {
                    logger.info('incremented num message by one', res);
                });
            });

            var clean_client = new CleanClient();
            var notifRequest = new NotifRequest(clean_client.genClient());

            notifRequest.flushNotificationRequest(id, socket.request.session.user.username, function(channel, rows) {
                clean_client.cleanup();
                logger.info('flushed notifs after socket reply');
            });
        });

        //TODO refactor back into above method, quick hack
        socket.on('direct_message', function(data) {
            socket.to(data.socketID).emit('direct_message', data);
        });

        socket.on('disconnect', function(data) {
            var url = urlParser.parse(socket.handshake.headers.referer);
            var id = parseID(url.pathname);
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

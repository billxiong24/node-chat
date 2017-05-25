var urlParser = require('url');

function init(http, sessionMiddleWare) {
    var io = require('socket.io')(http);
    /* Set up session variables for socket io */
    io.use(function(socket, next) {
        sessionMiddleWare(socket.request, socket.request.res, next);
    });

    io.on('connection', function(socket) {
        var url = urlParser.parse(socket.handshake.headers.referer);
        var id = parseID(url.pathname);
        var room = io.sockets.adapter.rooms[id];

        socket.on('connected', function(data) {
            var url = urlParser.parse(socket.handshake.headers.referer);
            var id = parseID(url.pathname);
            var room = io.sockets.adapter.rooms[id];
            room.sockets[socket.id] = socket.request.session.user.username;
            io.to(id).emit('connected', {user: socket.request.session.user, room: room});
            
        });
        socket.on('join', function(data) {
            socket.join(data.room);
        });

        socket.on('leave', function(data) {
            socket.leave(data.room);
        });

        /* Use socket.request.session to access session variables */
        socket.on('message', function(message) {
            //console.log(socket.handshake.headers);
            var url = urlParser.parse(socket.handshake.headers.referer);

            var message_info = {
                message : message, 
                username: socket.request.session.user.username,
                /* cookie set should be same as userid */
                cookie: socket.request.session.user.id
            }

            var id = parseID(url.pathname);
            //console.log(io.sockets.clients(id));

            io.to(id).emit('message', message_info);
        });

        socket.on('disconnect', function(data) {
            var url = urlParser.parse(socket.handshake.headers.referer);
            var id = parseID(url.pathname);
            var room = io.sockets.adapter.rooms[id];
            io.to(id).emit('disconnected', {user: socket.request.session.user, room: room});
        });
    });

    return io;
}


/* This is super ratchet */
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

module.exports = init
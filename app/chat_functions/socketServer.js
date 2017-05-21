
function init(app, http, sessionMiddleWare) {
    var io = require('socket.io')(http);
    /* Set up session variables for socket io */
    io.use(function(socket, next) {
        sessionMiddleWare(socket.request, socket.request.res, next);
    });

    io.on('connection', function(socket) {
        console.log("client connected");
        /* On connection, send to client list of chat ids, 
         * client will join those ids, send back to server, server will join too in order
         * to create a chat room */

        socket.on('join', function(data) {
            socket.join(data.room);
        });

        socket.on('leave', function(data) {
            socket.leave(data.room);
        });

        /* Use socket.request.session to access session variables */
        socket.on('message', function(message) {
            console.log(socket.id);
            var message_info = {
                message : message, 
                username: socket.request.session.user.username,
                /* cookie set should be same as userid */
                cookie: socket.request.session.user.id
            }
            io.to("room1").emit('message', message_info);
        });

        socket.on('disconnect', function(data) {
            console.log("Disconnecting");
        });

    });

    return io;
}
/* No idea why this code has to be in this specific order */

module.exports = init

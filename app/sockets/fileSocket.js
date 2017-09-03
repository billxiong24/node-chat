require('dotenv').config({path: __dirname + '/../../.env'});
var logger = require('../../util/logger.js')(module);
var Socket = require('./socket.js');
var deliv = require('delivery');
var Pic = require('../models/pic.js');
var PicManager = require('../chat_functions/pic_manager.js');

var FileSocket = function(io, namespace) {
    Socket.call(this, io, namespace);
};

FileSocket.prototype = Object.create(Socket.prototype);
FileSocket.prototype.constructor = FileSocket;

//override
FileSocket.prototype.init = function() {
    var that = this;
    this.addOnConnectionListener(function(socket) {
        socket = Socket.prototype.addJoinLeaveListener.call(that, socket);
        
        var delivery = deliv.listen(socket);
        delivery.on('receive.success', function(file) {
            var pic_manager = new PicManager(new Pic());
            pic_manager.storeImage(socket.request.session.user.id, file.name, file.buffer)
            .then(function(data) {
                logger.info(data);
                Socket.prototype.getIO.call(that).to('profile_'+socket.request.session.user.id).emit('storedImage', data); 
            });
        });
    });
};

module.exports = FileSocket;

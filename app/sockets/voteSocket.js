var logger = require('../../util/logger.js')(module);
var Socket = require('./socket.js');
const urlParser = require('url');
const VoteManager = require('../chat_functions/vote_manager.js');
const Vote= require('../models/vote.js');

var VoteSocket = function(io, namespace=null) {
    Socket.call(this, io, namespace);
};

VoteSocket.prototype = Object.create(Socket.prototype);
VoteSocket.prototype.constructor = VoteSocket;

VoteSocket.prototype.init = function() {
    var that = this;

    this.addOnConnectionListener(function(socket) {
        socket = Socket.prototype.addJoinLeaveListener.call(that, socket);

        socket.on('vote', function(data) {
            var chat_id = Socket.prototype.parseID.call(that, socket.handshake.headers.referer);

            //TODO fix check if user voted already
            var voted = false;

            var voteManager = new VoteManager(new Vote(chat_id, data.line_id));
            logger.debug(data.line_id, "line id in sockeet");
            voteManager.incrementVote(data.userid, data.line_id, function(err, newVote) {
                data.voted = voted;
                data.num_votes = newVote;
                Socket.prototype.getIO.call(that).to(chat_id).emit('vote', data);
            });
            

            //TODO update vote value in redis if user did not vote yet


        });
    });

    
};

module.exports = VoteSocket;

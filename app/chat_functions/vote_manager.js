const Vote = require('../models/vote.js');


var VoteManager = function(voteObj) {
    this._voteObj = voteObj;
};

VoteManager.prototype.getAllVotes = function() {
    return this._voteObj.readAll().then(function(data) { 
        return data;
    });
};

VoteManager.prototype.incrementVote = function(userid, line_id, callback) {
    this._voteObj.setLineID(line_id).increment(userid, function(err, newVote) {
        callback(err, newVote);
    });
};

VoteManager.prototype.decrementVote = function(line_id, callback) {
    this._voteObj.setLineID(line_id).decrement(function(err, newVote) {
        callback(err, newVote);
    });
};

module.exports = VoteManager;

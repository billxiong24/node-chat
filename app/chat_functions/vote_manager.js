const Vote = require('../models/vote.js');


var VoteManager = function(voteObj) {
    this._voteObj = voteObj;
};

VoteManager.prototype.getVotes = function(callback) {
    this._voteObj.readAll(function(err, voteResults) {
        if(!voteResults) {
            console.log("no votes");
        }

        callback(voteResults);
    });
};

module.exports = VoteManager;

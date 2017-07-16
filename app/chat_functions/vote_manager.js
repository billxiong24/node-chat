const Vote = require('../models/vote.js');


var VoteManager = function(voteObj) {
    this._voteObj = voteObj;
};

module.exports = VoteManager;

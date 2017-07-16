const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');

var Vote = function(chat_id, line_id) {
    this._chat_id = chat_id;
    this._line_id = line_id;
};

Vote.prototype.increment = function() {
    changeVote.call(this, 1);
};

Vote.prototype.decrement = function() {
    changeVote.call(this, -1);
};

Vote.prototype.read = function(callback) {
    cache_functions.retrieveJSONElement(getKey.call(this), this._line_id, function(err, reply) {
        callback(err, reply);
    });
};

Vote.prototype.flush = function() {
    
};

function changeVote(votes) {
    cache_functions.incrementJSONElement(getKey.call(this), this._line_id, votes, function(err, reply) {
        console.log("added a vote", reply);
    });
}

function getKey() {
    return 'votes:' + this._chat_id;
}



module.exports = Vote;

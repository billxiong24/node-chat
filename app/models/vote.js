const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');

var Vote = function(chat_id, line_id=null) {
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
        var result = !reply ? 0 : reply;

        callback(err, result);
    });
};

Vote.prototype.readAll = function(callback) {
    cache_functions.retrieveJSON(getKey.call(this), function(err, reply) {
        if(!reply) { 
            console.log("no votes"); 
        }
        callback(err, JSON.parse(reply));
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

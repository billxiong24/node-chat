const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');

var Vote = function(chat_id, line_id=null) {
    this._chat_id = chat_id;
    this._line_id = line_id;
};

Vote.prototype.getLineID = function() {
    return this._line_id;
};
Vote.prototype.setLineID = function(line_id) {
    this._line_id = line_id;
    return this;
};

Vote.prototype.increment = function(callback) {
    changeVote.call(this, 1, callback);
};

Vote.prototype.decrement = function(callback) {
    changeVote.call(this, -1, callback);
};

Vote.prototype.read = function(callback) {
    cache_functions.retrieveJSONElement(getKey.call(this), this._line_id, function(err, reply) {
        var result = !reply ? 0 : reply;

        callback(err, result);
    });
};

Vote.prototype.readAll = function() {
    return cache_functions.retrieveJSON(getKey.call(this), null, true);
};

Vote.prototype.flush = function() {
    
};

function changeVote(votes, callback) {
    cache_functions.incrementJSONElement(getKey.call(this), this._line_id, votes, function(err, reply) {
        callback(err, reply);
    });
}

function getKey() {
    return 'votes:' + this._chat_id;
}

module.exports = Vote;

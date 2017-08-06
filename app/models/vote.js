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

Vote.prototype.increment = function(userid, callback) {
    var checkVoted = cache_functions.addJSONElement(getUserVotesKey.call(this), 
        getUserVotesElementKey(userid, this._line_id), this._line_id, null, true);
    
    var that = this;
    checkVoted.then(function(reply) {
        //user has not voted before
        if(reply === 1) {
            changeVote.call(that , 1, callback);
        }
        else {
            changeVote.call(that, -1, callback);
        }
        return reply;
    }).then(function(reply) {
        if(reply === 0) {
            return cache_functions.removeJSONElement(getUserVotesKey.call(that), getUserVotesElementKey(userid, that._line_id), null, true);
        }
        return null;
    });
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

//i dont think we need to flush votes? just store in redis
Vote.prototype.flush = function() {
    
};

function changeVote(votes, callback) {
    console.log(getKey.call(this), this._line_id, " inserting vote into redis");
    cache_functions.incrementJSONElement(getKey.call(this), this._line_id, votes, function(err, reply) {
        callback(err, reply);
    });
}

function getKey() {
    return 'votes:' + this._chat_id;
}

function getUserVotesKey() {
    return 'uservotes:'+this._chat_id;
}

function getUserVotesElementKey(userid, line_id) {
    return userid + ":" + line_id;
}

module.exports = Vote;

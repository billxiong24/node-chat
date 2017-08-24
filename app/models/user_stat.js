require('dotenv').config({path: __dirname + '/../../.env'});
var logger = require('../../util/logger.js')(module);
var cache_functions = require('../cache/cache_functions.js');
var connection = require('../database/config.js');
var Vote = require('./vote.js');
var VoteManager = require('../chat_functions/vote_manager.js');

var UserStat = function() {
    this._cache_lines = null;
};

UserStat.prototype.getNumLines = function(chat_id) {
    var that = this;
    var getLines = function(result) {
        logger.debug(result.length);
        that._cache_lines = result;

        var counts = {};
        for(var i = 0, l = result.length; i < l; i++) {
            var line_count = counts[result[i].username];
            counts[result[i].username] = line_count ? line_count + 1 : 1;
        }
        //return a promsie object
        return Promise.resolve(counts);
    };

    if(!this._cache_lines) {
        return getAllLines.call(this, chat_id)
        .then(getLines);
    }
    return getLines(this._cache_lines);
};

UserStat.prototype.getUpVotes = function(chat_id) {
    var vote_manager = new VoteManager(new Vote(chat_id));
    var that = this;

    var getVotes = function(userLineCount) {
        that._cache_lines = userLineCount;
        return vote_manager.getAllVotes().then(function(votes) {
            var vote_counts = {};
            for(var i = 0, l = userLineCount.length; i < l; i++) {
                var line_id = userLineCount[i].line_id;
                if(!vote_counts[userLineCount[i].username]) {
                    vote_counts[userLineCount[i].username] = 0;
                }
                if(votes[line_id]) {
                    vote_counts[userLineCount[i].username]+=parseInt(votes[line_id]);
                }
            }
            return vote_counts;
        });
    };

    if(!this._cache_lines) {
        logger.debug('lines are null');
        return getAllLines.call(this, chat_id).then(getVotes);
    }
    return getVotes(this._cache_lines);
};

function getAllLines(chat_id) {
    var query = "SELECT username, line_id FROM ChatLines WHERE chat_id = ?"; 
    var that = this;
    return cache_functions.retrieveArray(chat_id, 0, -1, null, true).then(function(result) {
        if(!result) {
            logger.debug('result was null in line cahce');
            return [];
        }
        var arr = [];
        for(var i = 0, l = result.length; i < l; i++) {
            arr.push(JSON.parse(result[i]));
        }
        return arr;

    }).then(function(arr) {
        return connection.executePromise(query, [chat_id]).then(function(result) {
            if(!result) {
                return [];
            }
            if(!arr) {
                return result;
            }
            return arr.concat(result);
        });
    });
}

var userstat = new UserStat();

userstat.getNumLines('019274b44a472600').then(function(counts) {
    logger.debug(counts);
    return counts;
}).then(function(counts) {
return userstat.getUpVotes('019274b44a472600').then(function(result) {
    logger.debug(result);
});
});

module.exports = UserStat;

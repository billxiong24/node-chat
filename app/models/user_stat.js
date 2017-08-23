var cache_functions = require('../cache/cache_functions.js');
var connection = require('../database/config.js');
var Vote = require('./vote.js');
var VoteManager = require('../chat_functions/vote_manager.js');

var UserStat = function(username) {
    this._username = username;
};

UserStat.prototype.getNumLines = function(chat_id, callback) {
    var query = 'SELECT COUNT(message) as count FROM ChatLines WHERE username= ? AND chat_id= ?';
    var that = this;

    cache_functions.retrieveArray(chat_id, 0, -1, null, true)
    .then(function(result) {
        if(!result) {
            return null;
        }
        result = JSON.parse(result);
        var count = 0;
        for(var i = 0, l = result.length; i < l; i++) {
            if(result[i].username === that._username);
            count++;
        }
        return count;
    })
    .then(function(count) {
        connection.execute(query, [that._username, chat_id], function(result) {
            if(!result || result.length === 0 || !count) {
                return callback(null);
            }
            return callback(result[0].count + count);
        });
    });
};

UserStat.prototype.getUpVotes = function(chat_id, callback) {
    var that = this;
    cache_functions.retrieveArray(chat_id, 0, -1, null, true)
    .then(function(result) {
        if(!result) {
            return null;
        }
        return JSON.parse(result);
    })
    .then(function(result) {
        var query = 'SELECT line_id FROM ChatLines WHERE username = ? AND chat_id = ?';
        connection.execute(query, [that._username, chat_id], function(rows) {
            var vote_manager = new VoteManager(new Vote(chat_id));
            var arr = result.concat(rows);
            vote_manager.getAllVotes().then(function(votes) {
                votes = JSON.parse(votes);

                var vote_count = 0;
                for(var i = 0, l = arr.length; i < l; i++) {
                    var line_id = arr[i].line_id;
                    if(votes[line_id]) {
                        vote_count += parseInt(votes[line_id]);
                    }
                }

                return vote_count;
            }).then(function(count) {
                callback(count);
            });
        });
    });

};



module.exports = UserStat;

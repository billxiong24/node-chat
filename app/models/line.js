const connection = require('../database/config.js');
const Vote = require('./vote.js');
const VoteManager = require('../chat_functions/vote_manager.js');

var Line = function Line(chat_id=null, username=undefined, message=undefined, line_id=undefined) {
    this._chat_id = chat_id; 
    this._username = username; 
    this._message = message; 
    this._line_id = line_id; 

};


Line.prototype.toJSON = function() {
    return {
        chat_id: this._chat_id,
        username: this._username,
        message: this._message,
        line_id: this._line_id
    };
};
/*
 *Getters
 */
Line.prototype.getChatID = function() {
    return this._chat_id;
};

Line.prototype.getUsername = function() {
    return this._username;
};

Line.prototype.getMessage = function() {
    return this._message;
};

Line.prototype.getLineID = function() {
    return this._line_id;
};

/*
 *Setter
 */
Line.prototype.setChatID = function(id) {
    this._chat_id = id;
};

Line.prototype.insert = function() {
    var info = [this._chat_id, this._username, this._message, this._line_id];
    //TRIGGER IncrementNotification takes care of incrementing notifications
    //inserts are implicitly part of autocommit transaction? so ok
    connection.execute('INSERT INTO ChatLines (chat_id, username, message, stamp, line_id) VALUES (?, ?, ?, NOW(6), ?) ', info, function(rows) {
            
    }, function(err) {
        console.log(err);
        throw err;
    });
};

Line.prototype.read = function() {
    var chatID = this._chat_id;

    return function(poolConnection) {
        if(poolConnection === null) {
            return null;
        }
        var query =  'SELECT line_id, username, message, DATE_FORMAT(stamp, "%Y-%m-%d %H:%i:%s:%f") as stamp FROM ChatLines WHERE chat_id = ? ORDER BY DATE_FORMAT(stamp, "%Y-%m-%d %H:%i:%s:%f") DESC LIMIT 7';
        //connection.release(poolConnection);
        return poolConnection.query(query, [chatID]);
    };
};

//FIXME duplicated code here but im too lazy
Line.prototype.readNext = function(latestStamp, callback) {
    var chatID = this._chat_id;
    var voteManager = new VoteManager(new Vote(chatID));


    var lineResults = null;
    var quer = function(poolConnection) {
        if(poolConnection === null || latestStamp === null) {
            connection.release(poolConnection);
            return null;
        }

        var query =  'SELECT line_id, username, message, DATE_FORMAT(stamp, "%Y-%m-%d %H:%i:%s:%f") as stamp FROM ChatLines WHERE chat_id = ? AND stamp < DATE_FORMAT(?, "%Y-%m-%d %H:%i:%s:%f") ORDER BY stamp DESC LIMIT 15';

        connection.release(poolConnection);
        return poolConnection.query(query, [chatID, latestStamp]);
    };
    var setLines = function(lines) {
        lineResults = lines;
        return lines;
    };
    var getVotes = function(results) {
        return voteManager.getAllVotes();
    };

    var attachVotes = function(voteResults) {
        for(var i = 0; i < lineResults.length; i++) {
            lineResults[i].num_votes = voteResults[lineResults[i].line_id];
        }
        return lineResults;
    };
    connection.executePoolTransaction([quer, setLines, getVotes, attachVotes, callback], function(err) {console.log(err);});
};

module.exports = Line;

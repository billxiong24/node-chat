const connection = require('../database/config.js');

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
        var query =  'SELECT username, message, DATE_FORMAT(stamp, "%Y-%m-%d %H:%i:%s:%f") as stamp FROM ChatLines WHERE chat_id = ? ORDER BY DATE_FORMAT(stamp, "%Y-%m-%d %H:%i:%s:%f") DESC LIMIT 15';
        //connection.release(poolConnection);
        return poolConnection.query(query, [chatID]);
    };
};

Line.prototype.readNext = function(latestStamp, callback) {
    var chatID = this._chat_id;

    var quer = function(poolConnection) {
        if(poolConnection === null || latestStamp === null) {
            connection.release(poolConnection);
            return null;
        }

        var query =  'SELECT username, message, DATE_FORMAT(stamp, "%Y-%m-%d %H:%i:%s:%f") as stamp FROM ChatLines WHERE chat_id = ? AND stamp < DATE_FORMAT(?, "%Y-%m-%d %H:%i:%s:%f") ORDER BY stamp DESC LIMIT 15';

        connection.release(poolConnection);
        return poolConnection.query(query, [chatID, latestStamp]);
    };

    connection.executePoolTransaction([quer, callback], function(err) {console.log(err);});
};

module.exports = Line;

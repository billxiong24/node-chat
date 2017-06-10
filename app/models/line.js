const connection = require('../database/config.js');

var Line = (function() {
    /*
     *Constructor
     */
    function Line(chat_id=null, username=undefined, message=undefined, line_id=undefined) {
        this._chat_id = chat_id; 
        this._username = username; 
        this._message = message; 
        this._line_id = line_id; 
    }

    //this will come handly later
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
        var info = {
            chat_id: this._chat_id,
            username: this._username,
            message: this._message,
            line_id: this._line_id
        };
        //TRIGGER IncrementNotification takes care of incrementing notifications
        //inserts are implicitly part of autocommit transaction? so ok
        connection.execute('INSERT INTO ChatLines SET ? ', info, function(rows) {
                
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
            var query =  'SELECT username, message, stamp FROM ChatLines WHERE chat_id = ? ORDER BY stamp ASC';
            return poolConnection.query(query, [chatID]);
        };
    };

    return Line;
})();

module.exports = Line;

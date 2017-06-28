const connection = require('../database/config.js');
var Line = require('./line.js');
var LineCache = require('./line_cache.js');
var Notification = require('./notification.js');
const cache_functions = require('../cache/cache_functions.js');

var Chat = function Chat(id=null, name=null, code=null, stamp=null) {
        //emulates private variables, do not access outside
    this._id = id;
    this._name = name;
    this._code = code;
    this._stamp = stamp;

    this.getID = function() {
        return this._id;
    };

    this.getName = function() {
        return this._name;
    };

    this.getCode = function() {
        return this._code;
    };
    this.getStamp = function() {
        return this._stamp;
    };

    /*
     *Setter
     */
    this.setName = function(name) {
        this._name= name; 
    };
    this.setID = function(id) {
        this._id = id; 
    };
    this.setCode = function(code) {
        this._code = code; 
    };

    this.toJSON2 = function() { 
        return {
            id: this._id,
            name: this._name,
            code: this._code,
            stamp: this._stamp
        };
    };

    this.toJSON = function(username, notifs, lines) { 
        return {
            id: this._id,
            name: this._name,
            code: this._code,
            notifs: notifs,
            username: username,
            lines: lines
        };
    };

    this.render = function(notifs=0) {
        return {
            id: this._id,
            name: this._name,
            code: this._code,
            notifs: notifs
        };
    };

    /*
     * transport expects 3 params, Chat, Notif, and Line, and returns a function that takes in
     * the result of the previous promise function, which is the chat lines
     */
    this.load = function(user, transport) {
        //save these outside of scope, so they are saved from promise to promise
        var username = user.getUsername();
        var chatID = this._id;
        //hack
        var that = this;
        var chatLine = new Line(chatID);
        var notif = new Notification(chatID, username, 0);
        var conn = null;

        var getChat = function(poolConnection) {
            conn = poolConnection;
            return poolConnection.query('SELECT Chat.code, Chat.chat_name FROM Chat JOIN MemberOf ON Chat.id = MemberOf.chat_id AND MemberOf.username = ? AND MemberOf.chat_id = ?', [username, chatID]);
        };

        var transferChat = function(result) {
            if(result.length > 0) {
                that._code = result[0].code;
                that._name = result[0].chat_name;
                return conn;
            }
            that._code = that._name = null;
            return null;
        };

        var getNumNotifs = notif.load();

        var transferNotifs = function(result) {
            if(result === null) {
                return null;
            }
            if(result.length > 0) {
                notif.setNumNotifications(result[0].num_notifications);
            }
            return conn;
        };

        var releasing = function(result) {
            console.log("releasing connection");
            connection.release(conn);
        };

        var commit = transport(that, notif, chatLine);

        connection.executePoolTransaction([getChat, transferChat, getNumNotifs, transferNotifs, commit, releasing], function(err) { 
            throw err; 
        });
    };

    this.retrieveLines = function(callback) {
        var chatLine = new LineCache(this._id);
        var getLines = chatLine.read();


        var conn = null;
        var setConn = function(connect) {
            conn = connect;
            return connect;
        };

        var releaseConn = function(connect) {
            console.log("releasing connection");
            connection.release(conn);
        };
        var appendCacheLines = function(cacheResults) {
            return function(lineResults) {
                //TODO this is stupid, find a way around this
                for(var i = 0; i < cacheResults.length; i++)   {
                    cacheResults[i] = JSON.parse(cacheResults[i]);
                }

                return cacheResults.length === 0 ? lineResults : cacheResults.concat(lineResults);
            };
        };

        cache_functions.retrieveArray(this._id, 0, -1, function(err, result) {
            connection.executePoolTransaction([setConn, getLines, appendCacheLines(result), callback, releaseConn], function(err) {throw err;});
        });

    };


    /*
     * callback is the last function called in the promise chain
     */
    this.insert = function(user, callback=function(result) {}) {
        var conn = null;

        var chatInfo = {
            id: this._id,
            chat_name: this._name,
            code: this._code
        };
        var userTemp = user.getUsername();

        var startTrans = function(poolConnection) {
            conn = poolConnection;
            poolConnection.query('START TRANSACTION');
            return poolConnection;
        };
        var insertChat = function(poolConnection) {
            poolConnection.query('INSERT INTO Chat SET ?', chatInfo);
            return poolConnection;
        };

        var insertMember = function(poolConnection) {
            poolConnection.query('INSERT INTO MemberOf SET ?', {chat_id: chatInfo.id, username: userTemp});
            return poolConnection;
        };

        var err = function(err) {
            conn.query('ROLLBACK');
            console.log(err);
        };

        var commit = function(poolConnection) {
            var result = poolConnection.query('COMMIT');
            console.log("releasing connection");
            connection.release(poolConnection);
            return result;
        };

        connection.executePoolTransaction([startTrans, insertChat, insertMember, commit, callback], err);
    };

    this.join = function(user, callback) {
        var connect;
        var that = this;
        var username = user.getUsername();
        //var chatLine = new Line();

        var startTrans = function(poolConnection) {
            connect = poolConnection;
            poolConnection.query('START TRANSACTION');
            return poolConnection;
        };
        
        var retrieveChat = function(poolConnection) {
            return poolConnection.query('SELECT * FROM Chat WHERE Chat.code = ?', [that._code]);
        };

        var validateChat = function(result) {
            if(result.length === 0) {
                return null;
            }
            that._name = result[0].chat_name;
            that._id= result[0].id;
            that._stamp = result[0].stamp;

            return result[0];
        };

        var insertMembers = function(result) {
            if(result === null) {
                return null;
            }
            connect.query('INSERT IGNORE INTO MemberOf SET ?', {chat_id: result.id, username});
            return result;
        };

        var commit = function(result) {
            if(result === null) {
                return null;
            }
            connect.query('COMMIT');
            console.log("releasing connection");
            connection.release(connect);
            return result;
        };

        var err = function(err) {
            connect.query('ROLLBACK');
            console.log(err);
        };

        connection.executePoolTransaction([startTrans, retrieveChat, validateChat, insertMembers, commit, callback(that)], err);
    };

    this.loadLists = function(user, callback=function(rows) {}) {
        var query = 'SELECT Chat.chat_name, Chat.id, Notifications.num_notifications, MemberOf.username FROM Chat INNER JOIN MemberOf ON Chat.id = MemberOf.chat_id INNER JOIN Notifications ON Chat.id = Notifications.chat_id WHERE MemberOf.username = ? AND Notifications.username = ?';

        connection.execute(query, [user.getUsername(), user.getUsername()], callback);
        
    };
};

    /*
     *Getters
     */


module.exports = Chat;

const connection = require('../database/config.js');
var Line = require('./line.js');
var Notification = require('./notification.js');

var Chat = (function() {
    /*
     *Constructor
     */
    function Chat(id=null, name=null, code=null, stamp=null) {
        //emulates private variables, do not access outside
        this._id = id;
        this._name = name;
        this._code = code;
        this._stamp = stamp;
    }

    /*
     *Getters
     */
    Chat.prototype.getID = function() {
        return this._id;
    }

    Chat.prototype.getName = function() {
        return this._name;
    }

    Chat.prototype.getCode = function() {
        return this._code;
    }
    Chat.prototype.getStamp = function() {
        return this._stamp;
    }
    
    /*
     *Setter
     */
    Chat.prototype.setName= function(name) {
       this._name= name; 
    }
    Chat.prototype.setID = function(id) {
       this._id = id; 
    }
    Chat.prototype.setCode = function(code) {
       this._code = code; 
    }

    Chat.prototype.renderAll = function(username, notifs, lines) {
        var obj = this.render(notifs);
        obj.lines = lines;
        obj.username = username;
        return obj;
    }

    Chat.prototype.render = function(notifs=0) {
        return {
            id: this._id,
            name: this._name,
            code: this._code,
            notifs: notifs
        };
    }

    /*
     * transport expects 3 params, Chat, Notif, and Line, and returns a function that takes in
     * the result of the previous promise function, which is the chat lines
     */
    Chat.prototype.load = function(user, transport=function(obj1, obj2, obj3) { return function(r){}}) {
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
            if(result == null) {
                return null;
            }
            if(result.length > 0) {
                notif.setNumNotifications(result[0].num_notifications);
            }
            return conn;
        };
        var getLines = chatLine.read();
        var commit = transport(that, notif, chatLine);

        connection.executePoolTransaction([getChat, transferChat, getNumNotifs, transferNotifs, getLines, commit], function(err) { 
            throw err; 
        });
    }


    /*
     * callback is the last function called in the promise chain
     */
    Chat.prototype.insert = function(user, callback=function(result) {}) {
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
            connection.release(poolConnection);
            return result;
        };

        connection.executePoolTransaction([startTrans, insertChat, insertMember, commit, callback], err);
    }

    Chat.prototype.join = function(user, callback = function(chatobj) {return function(result){}}) {
        var connect;
        var that = this;
        var username = user.getUsername();
        var chatLine = new Line();

        var startTrans = function(poolConnection) {
            connect = poolConnection;
            poolConnection.query('START TRANSACTION');
            return poolConnection;
        };
        
        var retrieveChat = function(poolConnection) {
            return poolConnection.query('SELECT * FROM Chat WHERE Chat.code = ?', [that._code]);
        };

        var validateChat = function(result) {
            if(result.length == 0) {
                return null;
            }
            that._name = result[0].chat_name;
            that._id= result[0].id;
            that._stamp = result[0].stamp;

            return result[0];
        };

        var insertMembers = function(result) {
            if(result == null) {
                return null;
            }
            connect.query('INSERT IGNORE INTO MemberOf SET ?', {chat_id: result.id, username});
            return result;
        };

        var getLines = function(result) {
            if(result == null) {
                return null;
            }
            chatLine.setChatID(result.id);
            return chatLine.read()(connect);
        }

        var commit = function(result) {
            if(result == null) {
                return null;
            }
            connect.query('COMMIT');
            connection.release(connect);
            return result;
        }

        var err = function(err) {
            connect.query('ROLLBACK');
            console.log(err);
        };

        connection.executePoolTransaction([startTrans, retrieveChat, validateChat, insertMembers, getLines, commit, callback(that)], err);
    }

    Chat.prototype.loadLists = function(user, callback=function(rows) {}) {
        var query = 'SELECT Chat.chat_name, Chat.id, Notifications.num_notifications, MemberOf.username FROM Chat INNER JOIN MemberOf ON Chat.id = MemberOf.chat_id INNER JOIN Notifications ON Chat.id = Notifications.chat_id WHERE MemberOf.username = ? AND Notifications.username = ?';

        connection.execute(query, [user.getUsername(), user.getUsername()], callback);
        
    }

    return Chat;
})();

module.exports = Chat;

const connection = require('../database/config.js');
var Line = require('./line.js');
var LineCache = require('./line_cache.js');
var Notification = require('./notification.js');
var Vote = require('./vote.js');
var VoteManager = require('../chat_functions/vote_manager.js');
const cache_functions = require('../cache/cache_functions.js');

var Chat = function Chat(id=null, name=null, code=null, stamp=null) {
        //emulates private variables, do not access outside
    this._id = id;
    this._name = name;
    this._code = code;
    this._stamp = stamp;

};

    /*
     *Getters
     */

Chat.prototype.getID = function() {
    return this._id;
};

Chat.prototype.getName = function() {
    return this._name;
};

Chat.prototype.getCode = function() {
    return this._code;
};
Chat.prototype.getStamp = function() {
    return this._stamp;
};

/*
 *Setter
 */
Chat.prototype.setName = function(name) {
    this._name= name; 
};
Chat.prototype.setID = function(id) {
    this._id = id; 
};
Chat.prototype.setCode = function(code) {
    this._code = code; 
};

Chat.prototype.toJSON2 = function() { 
    return {
        id: this._id,
        name: this._name,
        code: this._code,
        stamp: this._stamp
    };
};

Chat.prototype.toJSON = function(username, notifs, lines) { 
    return {
        id: this._id,
        name: this._name,
        code: this._code,
        notifs: notifs,
        username: username,
        lines: lines
    };
};

Chat.prototype.render = function(notifs=0) {
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
Chat.prototype.load = function(user, transport) {
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

    //why tf are we loading notifs from database twice- cache this shit
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
        //NOTE error handling not so important here
        console.log(err);
        console.log("releasing connection from error");
        return connection.release(conn);
    });
};

Chat.prototype.retrieveLines = function(callback) {
    var chatLine = new LineCache(this._id);
    var voteManager = new VoteManager(new Vote(this._id));

    var that = this;

    var conn = null;
    var sqlLines = null;
    
    var setConn = function(connect) {
        conn = connect;
        return connect;
    };

    var getLines = chatLine.read();

    var setLines = function(lineResults) {
        sqlLines = lineResults;
        return lineResults;
    };

    var retrieveCacheLines = function(lineResults) {
        return cache_functions.retrieveArray(that._id, 0, -1, null, true);
    };
    var appendCacheLines = function(cacheResults) {
        for(var i = 0; i < cacheResults.length; i++)   {
            cacheResults[i] = JSON.parse(cacheResults[i]);
        }
        sqlLines = cacheResults.concat(sqlLines);
        return sqlLines;
    };
    
    var getVotes = function(lineResults) {
        return voteManager.getAllVotes();
    };
    var attachVotes = function(voteResults) {
        if(!voteResults) { return sqlLines; }
        for(var i = 0; i < sqlLines.length; i++) {
            sqlLines[i].num_votes = voteResults[sqlLines[i].line_id];
        }
        return sqlLines;
    };

    var releaseConn = function(connect) {
        console.log("releasing connection");
        return connection.release(conn);
    };
    var promises = [setConn, getLines, setLines, retrieveCacheLines, appendCacheLines, getVotes, attachVotes, callback, releaseConn];
    connection.executePoolTransaction(promises, function(err) {
        //NOTE error handling not important here either 
        console.log(err);
        console.log('releasing connection in error');
        connection.release(conn);
        return null;
    });
};


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
        return poolConnection.query('INSERT INTO Chat SET ?', chatInfo);
    };

    var insertMember = function(result) {
        return conn.query('INSERT INTO MemberOf SET ?', {chat_id: chatInfo.id, username: userTemp});
    };

    var err = function(err) {
        //TODO need real error handling here
        console.log("there was an error");
        conn.query('ROLLBACK');
        console.log("releasing connection after rollback");
        connection.release(conn);
    };

    var commit = function(reply) {
        var result = conn.query('COMMIT');
        console.log("releasing connection");
        connection.release(conn);
        return result;
    };

    connection.executePoolTransaction([startTrans, insertChat, insertMember, commit, callback], err);
};

Chat.prototype.join = function(user, callback) {
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
            connection.release(connect);
            return null;
        }
        connect.query('COMMIT');
        console.log("releasing connection in join chat");
        connection.release(connect);
        return result;
    };

    var err = function(err) {
        connect.query('ROLLBACK');
        console.log(err);
        connection.release(connect);
        return null;
    };

    connection.executePoolTransaction([startTrans, retrieveChat, validateChat, insertMembers, commit, callback(that)], err);
};

Chat.prototype.loadLists = function(user, callback=function(rows) {}, error=function(err) {console.log(err);}) {
    var query = 'SELECT Chat.chat_name, Chat.id, Chat.code, Notifications.num_notifications, MemberOf.username FROM Chat INNER JOIN MemberOf ON Chat.id = MemberOf.chat_id INNER JOIN Notifications ON Chat.id = Notifications.chat_id WHERE MemberOf.username = ? AND Notifications.username = ?';

    connection.execute(query, [user.getUsername(), user.getUsername()], callback, error);
    
};

module.exports = Chat;

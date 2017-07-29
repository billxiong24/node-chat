require('dotenv').config();
var User = require('./user.js');
const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');
const password_util = require('../authentication/password_util.js');
const crypto = require('crypto');
function defaultErrorCB(err) {
    console.log(err);
}

var UserCache = function (username, id=undefined, password=undefined, first=undefined, last=undefined, email=undefined) {
    User.call(this, username, id, password, first, last, email);
};

UserCache.prototype = Object.create(User.prototype);
UserCache.prototype.constructor = UserCache;


UserCache.prototype.read = function() {
    return User.prototype.read.call(this);
};

UserCache.prototype.insert = function(callback = function(rows) {}, errorCallback=defaultErrorCB) {
    var userObj = User.prototype.toJSON.call(this);
    var that = this;
    var conn;
    var hash = crypto.randomBytes(10).toString('hex');
    var startTrans = function(poolConnection) {
        conn = poolConnection;
        poolConnection.query('START TRANSACTION');
        return poolConnection;
    };
    var insertUser = function(poolConnection) {
        return poolConnection.query('INSERT INTO User SET ?', userObj);
    };

    var insertEmail = function(poolConnection) {
        return conn.query('INSERT INTO EmailConfirm SET ?', {
            hash: hash,
            username: that.getUsername()
        });
    };

    var err = function(err) {
        //TODO need real error handling here
        console.log('user sign up has an error');
        conn.query('ROLLBACK');
        console.log('releasing connection in sign up error');
        connection.release(conn);
        errorCallback(err); 
        return null;
    };

    var commit = function(result) {
        var finished = conn.query('COMMIT');
        console.log("releasing connection");
        connection.release(conn);
        userObj.hash = hash;
        userObj.confirmed = false;
        that.addToCache(userObj);
        callback(result);
        return finished;
    };

    connection.executePoolTransaction([startTrans, insertUser, insertEmail, commit], err);
};

UserCache.prototype.addToCache = function(jsonObj = null) {
    var userObj = !jsonObj ? User.prototype.toJSON.call(this) : jsonObj;
    return cache_functions.addJSON(this.getKey(), userObj, null, true);
};

UserCache.prototype.retrieveFromCache = function() {
    return cache_functions.retrieveJSON(this.getKey(), null, true);
};

UserCache.prototype.flush = function() {

};

UserCache.prototype.getKey = function() {
    return 'info:'+User.prototype.getUsername.call(this);
};

UserCache.prototype.leaveChat = function(chat_id, callback) {
    User.prototype.leaveChat.call(this, chat_id, callback);
};


//TODO function works, add user back to cache if not in
UserCache.prototype.confirmPassword = function(password, callback) {
    var that = this;
    cache_functions.retrieveJSON(this.getKey(), null , true).then(function(result) {
        return result;
    }).then(function(result) {
        //if result, user found in cache
        return result ? password_util.retrievePassword(password, result.password, null, true) : 'not cache';
    }).then(function(result) {
        if(result !== 'not cache') {
            callback(result);
        }
        return result !== 'not cache';
    }).then(function(result) {
        if(result) {
            return null;
        }
        //hitting db, since user was not in cache
        var conn;
        var setConn = function(poolConnection) {
            conn = poolConnection;
            return conn;
        };
        var end = function(res) {
            return password_util.retrievePassword(password, res[0].password, null, true).then(function(result) {
                console.log("releasing connection");
                connection.release(conn);
                callback(result);
            });
        };
        return connection.executePoolTransaction([setConn, that.read(), end], function(err) {
            return console.log(err);
        });
    });
};

UserCache.prototype.updateSettings = function(newPass, newEmail, callback=function(rows) {}) {
    var query = 'UPDATE User SET password = ?, email = ? WHERE username = ?';
    connection.execute(query, [newPass, newEmail, this._username], function(rows) {
        callback(rows);
    }, function(err) {
        return console.log(err);
    });
};


module.exports = UserCache;

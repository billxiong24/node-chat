/*jshint sub:true*/
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
    this._inCache = false;
};

UserCache.prototype = Object.create(User.prototype);
UserCache.prototype.constructor = UserCache;

UserCache.prototype.getInCache = function() {
    return this._inCache;
};

UserCache.prototype.read = function() {
    var that = this;
    var cacheRetrieve = this.retrieveFromCache();
    //wtf is this lmao
    return function(poolConnection) {
        return cacheRetrieve.then(function(result) {
            if(result) {
                console.log("found user in cache when reading");
                that._inCache = true;
                return [result];
            }
            that._inCache = false;
            return User.prototype.read.call(that)(poolConnection);
        });
    };
};

//NOTE need to return queries inorder to catch errors 
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
        userObj.confirmed = 0;
        that.addToCache(userObj);
        callback(userObj);
        return finished;
    };

    connection.executePoolTransaction([startTrans, insertUser, insertEmail, commit], err);
};

UserCache.prototype.addToCache = function(jsonObj = null) {
    var userObj = !jsonObj ? User.prototype.toJSON.call(this) : jsonObj;
    this._inCache = true;
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
        return result && result.password ? password_util.retrievePassword(password, result.password, null, true) : 'not cache';
    }).then(function(result) {
        if(result !== 'not cache') {
            that._inCache = true;
            callback(result);
        }
        return result !== 'not cache';
    }).then(function(result) {
        if(result) {
            return null;
        }
        //hitting db, since user was not in cache
        that._inCache = false;
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

UserCache.prototype.confirmEmail = function(sessionUser, hash, callback) {
    //update cache and database as per write through policy
    //FIXME assuming user in cache, since user has just logged in- risky but low chance of anything otherwise 
    //this route will be authenticated, so ya but i really need to fix this

    var that = this;
    cache_functions.retrieveJSON(this.getKey(), null, true)
    .then(function(result) {
        if(!result.hash) {
            return null;
        }
        if(result.hash !== hash) {
            return null;
        }

        //NOTE if we use passport's builtin serialize/deserialize, we dont need to update session user  
        sessionUser['confirmed'] = 1;
        sessionUser['hash'] = 0;
        return result;
    }).then(function(result) {
        if(!result) {
            return callback(null);
        }

        return cache_functions.addJSON(that.getKey(), sessionUser, null, true)
        .then(function(result) {
            var query ='UPDATE EmailConfirm SET hash = ?, confirmed = 1 WHERE username = ?';
            //update to hash to something random that no one will ever know
            connection.execute(query, [crypto.randomBytes(34).toString('hex'), that.getUsername()], function(rows) {
                callback(rows);
            });
        });
    });
};


module.exports = UserCache;

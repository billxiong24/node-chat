/*jshint sub:true*/
var logger = require('../../util/logger.js')(module);
var User = require('./user.js');
const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');
const password_util = require('../authentication/password_util.js');
const crypto = require('crypto');
function defaultErrorCB(err) {
    logger.error(err);
}

//TODO USE TRANSACTION for multiple redis commands for atomicity

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
    //TODO avoid having to open a connection(small optimization)
    return function(poolConnection) {
        return cacheRetrieve.then(function(result) {
            //logger.info(result);
            if(result) {
                logger.info("found user in cache when reading");
                that._inCache = true;
                return [result];
            }
            that._inCache = false;
            logger.info("user cache miss when reading");

            //if cache miss, we add the result to cache as per write through policy
            return User.prototype.read.call(that)(poolConnection).then(function(result) {
                if(result.length === 0) {
                    return result;
                }
                var sqlUser = result[0];
                sqlUser.confirmed = (sqlUser.confirmed === null) ? 1 : parseInt(sqlUser.confirmed);
                sqlUser.hash = (sqlUser.hash === null) ? 1 : sqlUser.hash;
                that.addToCache(sqlUser);
                return result;
            });
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
        logger.error('user sign up has an error');
        conn.query('ROLLBACK');
        logger.debug('releasing connection in sign up error');
        connection.release(conn);
        errorCallback(err); 
        return null;
    };

    var commit = function(result) {
        var finished = conn.query('COMMIT');
        logger.debug("releasing connection");
        connection.release(conn);

        userObj.hash = hash;
        userObj.confirmed = 0;
        that.addToCache(userObj);
        callback(userObj);
        return finished;
    };

    connection.executePoolTransaction([startTrans, insertUser, insertEmail, commit], err);
};

UserCache.prototype.addToCache = function(jsonObj = null, inclPass = true) {
    var userObj = !jsonObj ? User.prototype.toJSON.call(this) : jsonObj;
    this._inCache = true;
    if(!inclPass) {
        delete userObj.password;
    }
    return cache_functions.addJSON(this.getKey(), userObj, null, true);
};

UserCache.prototype.addFieldToCache = function(field, value) {
    cache_functions.addJSONElement(this.getKey(), field, value, function(result) {
        logger.info(result, 'adding specific field');

    });
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
            if(res.length === 0) {
                return callback(null);
            }
            return password_util.retrievePassword(password, res[0].password, null, true).then(function(result) {
                logger.debug("releasing connection");
                connection.release(conn);
                callback(result);
            });
        };
        return connection.executePoolTransaction([setConn, that.read(), end], function(err) {
            return logger.error(err);
        });
    });
};

UserCache.prototype.changePassword = function(callback) {
    var pass = this.getPassword();
    var username = this.getUsername();
    var that = this;

    var query = 'UPDATE User SET password = ? WHERE username = ?';
    connection.execute(query, [pass, username], function(rows) {
        //FIXME only update password in cache
        that.addFieldToCache('password', pass);
        callback(rows);

    }, function(err) {
        logger.error(err);
    });
};
UserCache.prototype.updateSettings = function(newObj, callback=function(rows) {}) {
    //need to update cache and database at the same time
    var that = this;
    var oldUsername = this.getUsername();
    var oldID = this.getID();
    this.setJSON(newObj);
    //HACK since newobj will not contain the userid
    this.setID(oldID);
    this.setUsername(oldUsername);

    logger.debug('old username', oldUsername);

    var query = 'UPDATE User SET username = ?, first = ?, last = ?, email = ? WHERE username = ?';
    connection.execute(query, [
        this.getUsername(),
        this.getFirst(),
        this.getLast(),
        this.getEmail(),
        oldUsername
    ], function(rows) {
        if(rows.affectedRows === 0) {
            return callback(rows, null);
        }
        //we're gonna have to update cache anyways
        that.addToCache({
            first: that.getFirst(),
            last: that.getLast(),
            email: that.getEmail()
        }, false);
        //sessionObj = that.toJSON();
        callback(rows, that.toJSON());

    }, function(err) {
        return logger.error(err);
    });
};
UserCache.prototype.confirmEmail = function(sessionUser, hash, callback) {
    //update cache and database as per write through policy
    //FIXME assuming user in cache, since user has just logged in- risky but low chance of anything otherwise 
    //this route will be authenticated, so ya but i really need to fix this
    var sessUser = Object.assign({}, sessionUser);

    var that = this;
    cache_functions.retrieveJSON(this.getKey(), null, true)
    .then(function(result) {
        if(!result.hash) {
            return null;
        }
        //this is where we check if same user- random user can't just confirm email 
        if(result.hash !== hash) {
            return null;
        }

        //NOTE if we use passport's builtin serialize/deserialize, we dont need to update session user  
        return result;
    }).then(function(result) {
        if(!result) {
            return callback(null, null);
        }
        sessUser['confirmed'] = 1;
        sessUser['hash'] = 0;

        return cache_functions.addJSON(that.getKey(), sessUser, null, true)
        .then(function(result) {
            var query ='UPDATE EmailConfirm SET hash = ?, confirmed = 1 WHERE username = ?';
            //update to hash to something random that no one will ever know
            connection.execute(query, [crypto.randomBytes(34).toString('hex'), that.getUsername()], function(rows) {
                if(rows.affectedRows === 0) {
                    callback(rows, null);
                }
                callback(rows, sessUser);
            });
        });
    });
};


module.exports = UserCache;

var UserCache = require('./user_cache.js');
var cache_functions = require('../cache/cache_functions.js');
var connection = require('../database/config.js');
var password_util = require('../authentication/password_util.js');

var UserManager = function(userObj) {
    this._userObj = userObj;
}; 

UserManager.prototype.leave = function(chat_id, callback) {
    this._userObj.leaveChat(chat_id, callback);
};

//FIXME refactor this to use redis promises (bluebird) 

UserManager.prototype.signup = function(password, signupFailure, signupSuccess) {
    var that = this;
    password_util.storePassword(password, function(err, hash) {
        that._userObj.setPassword(hash);
        that._userObj.insert(function(userObj) {
            var jsonObj = userObj;
            delete jsonObj.password;
            return signupSuccess(jsonObj);
        },
        function(err) {
            return signupFailure();
        });
    });
};

UserManager.prototype.authenticate = function(password, loginResult) {
    var conn = null;
    var inCache = false;
    var user = this._userObj;
    var setConn = function(poolConnection) { conn = poolConnection; return poolConnection; };
    var checkDB = user.read();

    var sqlUser = null;
    var validate = function(rows) {
        if(rows.length === 0) {
            return null;
        }
        sqlUser = rows[0];
        return rows[0];
    };
    var retrievePassword = function(result) {
        if(!result) { return null; }
        return password_util.retrievePassword(password, result.password, null, true);
    };

    var loginValidate = function(result) {
        console.log("releasing connection");
        connection.release(conn);

        if(!result) { return null; }
        if(!user.getInCache()) { 
            console.log("user login cache miss");
            //redis does not store null values, for users created previously, just
            //let them pass
            sqlUser.confirmed = (sqlUser.confirmed === null) ? 1 : sqlUser.confirmed;
            sqlUser.hash = (sqlUser.hash === null) ? 1 : sqlUser.hash;
            user.addToCache(sqlUser);
        }
        delete sqlUser.password;
        return sqlUser;
    };
    connection.executePoolTransaction([setConn, checkDB, validate, retrievePassword, loginValidate, loginResult], function(err) {console.log(err);});
};

UserManager.prototype.authenticateEmail = function(userJSON, hash, callback) {
    this._userObj.confirmEmail(userJSON, hash, function(rows) {
        callback(rows);
    });   
};

module.exports = UserManager;

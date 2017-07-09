var UserCache = require('./user_cache.js');
var cache_functions = require('../cache/cache_functions.js');
var connection = require('../database/config.js');
var password_util = require('../authentication/password_util.js');

var UserManager = function(userObj) {
    this._userObj = userObj;
}; 

UserManager.prototype.signup = function(password, signupFailure, signupSuccess) {
    var that = this;
    password_util.storePassword(password, function(err, hash) {
        that._userObj.setPassword(hash);
        that._userObj.insert(function(rows) {
            var jsonObj = that._userObj.toJSON();
            delete jsonObj.password;
            return signupSuccess(jsonObj);
        }, 
        function(err) {
            return signupFailure();
        });
    });
};

UserManager.prototype.authenticate = function(password, loginFailure, loginSuccess) {
    var conn = null;
    var inCache = false;
    var user = this._userObj;
    var setConn = function(poolConnection) { conn = poolConnection; return poolConnection; };
    var checkDB = user.read();
    var validate = function(rows) {
        if(rows.length === 0) {
            console.log("login failed");
            return loginFailure();
        }
        password_util.retrievePassword(password, rows[0].password, function(err, result) {
            if(result) {
                if(!inCache) { 
                    console.log("user login cache miss");
                    user.addToCache(rows[0]);
                }
                delete rows[0].password;
                return loginSuccess(rows[0]);
            }
            console.log("username exists, login failed");
            return loginFailure();
        });
        console.log("releasing connection");
        connection.release(conn);
    };
    user.retrieveFromCache(function(err, result) {
        if(result) {
            console.log("found user cache when logging in");
            checkDB = function(poolConnection) {
                inCache = true;
                return [result]; 
            };
        }
        connection.executePoolTransaction([setConn, checkDB, validate], function(err) {console.log(err);});
    });
};

module.exports = UserManager;

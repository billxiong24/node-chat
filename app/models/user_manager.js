var UserCache = require('./user_cache.js');
var cache_functions = require('../cache/cache_functions.js');
var connection = require('../database/config.js');
var password_util = require('../authentication/password_util.js');

var UserManager = function(userObj) {
    this._userObj = userObj;
}; 

UserManager.prototype.authenticate = function(password, loginFailure, loginSuccess) {
    var conn = null;
    var inCache = false;
    var user = this._userObj;
    var setConn = function(poolConnection) { conn = poolConnection; return poolConnection; };
    var checkDB = user.read();
    var validate = function(rows) {
        if(rows.length === 0) {
            return loginFailure();
        }
        password_util.retrievePassword(password, rows[0].password, function(err, result) {
            if(result) {
                if(!inCache) { 
                    console.log("user login cache miss");
                    user.addToCache(rows[0]);
                }
                return loginSuccess(rows[0]);
            }
            return loginFailure();
        });
        console.log("releasing connection");
        connection.release(conn);
    };

    cache_functions.retrieveJSON(user.getKey(), function(err, result) {
        if(result) {
            console.log("found user cache when loggin in");
            checkDB = function(poolConnection) {
                inCache = true;
                return [result]; 
            };
        }
        connection.executePoolTransaction([setConn, checkDB, validate], function(err) {console.log(err);});
    });
    
};

module.exports = UserManager;

require('dotenv').config();
var User = require('./user.js');
const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');
const password_util = require('../authentication/password_util.js');
function defaultErrorCB(err) {
    console.log(err);
}

var UserCache = function (username, id=undefined, password=undefined, first=undefined, last=undefined) {
    User.call(this, username, id, password, first, last);
};

UserCache.prototype = Object.create(User.prototype);
UserCache.prototype.constructor = UserCache;


UserCache.prototype.read = function() {
    return User.prototype.read.call(this);
};

UserCache.prototype.insert = function(callback = function(rows) {}, errorCallback=defaultErrorCB) {
    var userObj = User.prototype.toJSON.call(this);
    var that = this;
    //write through
    connection.execute('INSERT INTO User SET ? ', userObj, function(rows) {
        //only add to cache if no database errors, otherwise we have invalid data in cache
        that.addToCache();
        callback(rows);
    }, errorCallback); 
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


//FIXME this function probably does not work, but i wanna go to the gym now
UserCache.prototype.confirmPassword = function(password, callback) {
    //first check cache for user, then check database, then compare password hashes
    //this is surprising complicated
    var that = this;
    var inCache = false;
    cache_functions.retrieveJSON(this.getKey(), null , true)
    .then(function(result) {
        if(!result) {
            return inCache;
        }
        inCache = true;
        return result;
    }).then(function(result) {
        if(result) {
           return password_util.retrievePassword(password, result.password, null, true);
        }
        return 'not in cache';
    }).then(function(result) {
        if(result !== 'not in cache') {
            callback(result);
            return true;
        }
        return null;
    }).then(function(result) {
        if(result) {
            return null;
        }

        console.log("hitting the database");
        var end = function(res) {
            return password_util.retrievePassword(password, res[0].password, null, true).then(callback);
        };
        return connection.executePoolTransaction([that.read(), end], function(err) {
            return console.log(err);
        });
    });
};

module.exports = UserCache;

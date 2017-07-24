var User = require('./user.js');
const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');
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
    cache_functions.addJSON(this.getKey(), userObj, function(err, reply) {});
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

module.exports = UserCache;

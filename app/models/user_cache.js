var User = require('./user.js');
const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');

var UserCache = function (username, id=undefined, password=undefined, first=undefined, last=undefined) {
    User.call(this, username, id, password, first, last);
};

UserCache.prototype = Object.create(User.prototype);
UserCache.prototype.constructor = UserCache;


UserCache.prototype.read = function() {
    return User.prototype.read.call(this);
};

UserCache.prototype.insert = function(callback = function(rows) {}) {
    var userObj = User.prototype.toJSON.call(this);
    //write through
    cache_functions.addJSON('info:'+User.prototype.getUsername.call(this), userObj, function(err, reply) {});

    connection.execute('INSERT INTO User SET ? ', userObj, callback); 
};

UserCache.prototype.addToCache = function(jsonObj = null) {
    var userObj = !jsonObj ? User.prototype.toJSON.call(this) : jsonObj;
    cache_functions.addJSON(this.getKey(), userObj, function(err, reply) {});
};

UserCache.prototype.retrieveFromCache = function(callback) {
    cache_functions.retrieveJSON(this.getKey(), function(err, result) {
        callback(err, result);
    });
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

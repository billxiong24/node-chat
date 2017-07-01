const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');
const Notification = require('./notification.js');

var NotifCache = function(chatID, username, num_notifications) {
    Notification.call(this, chatID, username, num_notifications);
};

NotifCache.prototype = Object.create(Notification.prototype);
NotifCache.prototype.constructor = NotifCache;

//override
NotifCache.prototype.load = function(callback) {
    //call super class method for now
    var username = Notification.prototype.getUsername.call(this);
    cache_functions.retrieveJSONElement("notif:"+chatID, username, function(err, result) {
        if(!result) {
            cache_functions.addJSONElement("notif:"+chatID, username, 0, function(err, reply) {});
            callback(err, 0);
        }
        else {
            callback(err, result);
        }
    });
    return Notification.prototype.load.call(this);
};

//override
NotifCache.prototype.write = function() {
    var that = this;
    var username = Notification.prototype.getUsername.call(this);
    var notifs = Notification.prototype.getNumNotifications.call(this);
    var chatID = Notification.prototype.getChatID.call(this);
    
    //give yourself 0 notifications, every one else is + 1
         
    cache_functions.retrieveJSON("notif:"+chatID,  function(err, result) {
        var jsonObj = JSON.parse(result);
        for(var key in jsonObj) {
            jsonObj[key] = (key === username) ? 0 : jsonObj[key] + 1;
        }
        console.log("notification cached");
    });
};

NotifCache.prototype.flush = function() {

    
};

//override
NotifCache.prototype.reset = function() {
    Notification.prototype.setNumNotifications.call(this, 0);
    this.write();
};


module.exports = NotifCache;

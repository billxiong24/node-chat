const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');
const Notification = require('./notification.js');

var NotifCache = function(chatID, username, num_notifications) {
    Notification.call(this, chatID, username, num_notifications);
};

NotifCache.prototype = Object.create(Notification.prototype);
NotifCache.prototype.constructor = NotifCache;

//override
NotifCache.prototype.load = function() {
    //call super class method for now
    return Notification.prototype.load.call(this);
};

//override
NotifCache.prototype.write = function() {
    var that = this;
    var username = Notification.prototype.getUsername.call(this);
    var notifs = Notification.prototype.getNumNotifications.call(this);
    var chatID = Notification.prototype.getChatID.call(this);

         
    cache_functions.addJSONElement(username+":notif", chatID, notifs, function(err, result) {
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

const connection = require('../database/config.js');
const Notification = require('../models/notification.js');

var NotificationManager = function(notifObj) {
    this._notifObj = notifObj;
};

NotificationManager.prototype.loadNotifications = function(callback) {
     
    var notifLoad = this._notifObj.load();
    var setNotif = function(result) {
        return result.length > 0 ? result[0].num_notifications : null;
    };
    connection.executePoolTransaction([notifLoad, setNotif, callback], function(err) {throw err;});
};

NotificationManager.prototype.flushNotifications = function(callback) {
    this._notifObj.flush(function(rows) {
        callback(rows);
    });
};

module.exports = NotificationManager;

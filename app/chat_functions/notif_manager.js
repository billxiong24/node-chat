const connection = require('../database/config.js');
const Notification = require('../models/notification.js');

var NotificationManager = function(notifObj) {
    this._notifObj = notifObj;
};

NotificationManager.prototype.loadNotifications = function(callback) {
     
    //release the connection
    var conn = null;
    var setConn = function(poolConnection) {
        conn = poolConnection;
        return conn;
    };
    var notifLoad = this._notifObj.load();
    var setNotif = function(result) {
        return result.length > 0 ? result[0].num_notifications : null;
    };
    var end = function(result) {
        console.log('releasing notification connection load');
        connection.release(conn);
    };
    connection.executePoolTransaction([setConn, notifLoad, setNotif, callback, end], function(err) {throw err;});
};

NotificationManager.prototype.flushNotifications = function(callback) {
    this._notifObj.flush(function(rows) {
        callback(rows);
    });
};

NotificationManager.prototype.setNotification = function(notifObj) {
    this._notifObj = notifObj;
};

module.exports = NotificationManager;

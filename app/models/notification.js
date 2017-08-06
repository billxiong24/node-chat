const connection = require('../database/config.js');

var Notification = function Notification(chatID, username, num_notifications) {
    this._chatID = chatID;
    this._username = username;
    this._num_notifications = num_notifications;

};

Notification.prototype.toJSON = function() {
    return {
        chatID: this._chatID,
        username: this._username,
        num_notifications: this._num_notifications
    };
};

/*
 *Getters
 */
Notification.prototype.getChatID = function() {
    return this._chatID;
};

Notification.prototype.getUsername = function() {
    return this._username;
};

Notification.prototype.getNumNotifications= function() {
    return this._num_notifications;
};

Notification.prototype.setNumNotifications = function(num) {
    this._num_notifications = num;
};

Notification.prototype.load = function() {
    var username = this._username;
    var chatID = this._chatID;

    return function(poolConnection) {
        if(poolConnection === null) {
            return null;
        }
        return poolConnection.query('SELECT num_notifications FROM Notifications WHERE username = ? AND chat_id = ?', [username, chatID]);
    };
};

Notification.prototype.flush = function(callback = function(result) {}) {
    var query =  "UPDATE Notifications SET num_notifications = IF (username=?, 0, num_notifications+1) WHERE Notifications.chat_id = ? ";

    connection.execute(query, [this._username, this._chatID], function(result) {
        callback(result);
    });
};

module.exports = Notification;

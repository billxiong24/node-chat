const connection = require('../database/config.js');

var Notification = (function() {
    
    function Notification(chatID, username, num_notifications) {
        this._chatID = chatID;
        this._username = username;
        this._num_notifications = num_notifications;
    }

    //this will come handy later
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

    Notification.prototype.write = function() {
        var info = {
            chat_id: this._chatID,
            username: this._username,
            num_notifications: this._num_notifications 
        };
        connection.execute('INSERT INTO Notifications SET ?', info);
    };

    Notification.prototype.reset = function() {
        this.setNumNotifications(0);
        connection.execute('UPDATE Notifications SET num_notifications = ?', [0]);
    };

    return Notification;
})();

module.exports = Notification;

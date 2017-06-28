const connection = require('../database/config.js');

var Notification = function Notification(chatID, username, num_notifications) {
    this._chatID = chatID;
    this._username = username;
    this._num_notifications = num_notifications;

    //this will come handy later
    this.toJSON = function() {
        return {
            chatID: this._chatID,
            username: this._username,
            num_notifications: this._num_notifications
        };
    };
    
    /*
     *Getters
     */
    this.getChatID = function() {
        return this._chatID;
    };

    this.getUsername = function() {
        return this._username;
    };

    this.getNumNotifications= function() {
        return this._num_notifications;
    };

    this.setNumNotifications = function(num) {
        this._num_notifications = num;
    };

    this.load = function() {
        var username = this._username;
        var chatID = this._chatID;

        return function(poolConnection) {
            if(poolConnection === null) {
                return null;
            }
            return poolConnection.query('SELECT num_notifications FROM Notifications WHERE username = ? AND chat_id = ?', [username, chatID]);
        };
    };

    this.write = function() {
        var info = {
            chat_id: this._chatID,
            username: this._username,
            num_notifications: this._num_notifications 
        };
        connection.execute('INSERT INTO Notifications SET ?', info);
    };

    this.reset = function() {
        this.setNumNotifications(0);
        connection.execute('UPDATE Notifications SET num_notifications = ?', [0]);
    };
};

module.exports = Notification;

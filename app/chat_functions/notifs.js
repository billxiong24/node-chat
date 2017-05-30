var connection = require('../database/config.js');

function retrieveNotifications(username, chatID) {
    return function(poolConnection) {
        return poolConnection.query('SELECT num_notifications FROM Notifications WHERE username = ? AND chat_id = ?', [username, chatID]);
    }
}

//actually this is handled by a trigger, keep this here for flexiblity 
function writeNotification(username, chatID, num_notifs) {
    var info = {
        chat_id: chatID,
        username: username,
        num_notifications: num_notifs
    };
    connection.execute('INSERT INTO Notifications SET ?', info);
}

function resetNotifications(username, chatID) {
    connection.execute('UPDATE Notifications SET num_notifications = ?', [0]);
}

module.exports = {retrieveNotifications, writeNotification, resetNotifications};

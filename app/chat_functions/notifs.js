var connection = require('../database/config.js');

function retrieveNotifications(username, chatID) {
    connection.establishConnection(function(err) {});

    connection.execute('SELECT num_notifications FROM Notifications WHERE username = ? AND chat_id = ?', [username, chatID], function(err, rows) {
        //do stuff
    });
}

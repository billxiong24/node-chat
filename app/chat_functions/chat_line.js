var connection = require('../database/config.js');
const crypto = require('crypto');

function addLine(chatID, username, line) {
    connection.establishConnection(function(err) {});

    var info = {
        chat_id: chatID,
        username: username,
        text: line
    };
    //TRIGGER IncrementNotification takes care of incrementing notifications
    //inserts are implicitly part of autocommit transaction? so ok
    connection.execute('INSERT INTO ChatLines SET ? ', info, function(err, rows) {
                
    });
}

//TODO get n most recent, order by oldest to newest.
function readLines(chatID) {
    connection.establishConnection(function(err) {});
    var query =  'SELECT username, message, stamp FROM ChatLines WHERE chat_id = ? ORDER BY stamp ASC';
    connection.execute(query, [chatID], function(err, rows) {
        //do stuff with rows
    }
}


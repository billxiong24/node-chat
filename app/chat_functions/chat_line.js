var connection = require('../database/config.js');
const crypto = require('crypto');

function addLine(chatID, username, line) {
    var info = {
        chat_id: chatID,
        username: username,
        message: line,
        line_id: crypto.randomBytes(24).toString('hex')
    };
    //TRIGGER IncrementNotification takes care of incrementing notifications
    //inserts are implicitly part of autocommit transaction? so ok
    connection.execute('INSERT INTO ChatLines SET ? ', info, function(rows) {
            
    }, function(err) {
        console.log(err);
        throw err;
    });
}

//TODO get n most recent, order by oldest to newest.
function readLines(chatID) {
    return function(poolConnection) {
        var query =  'SELECT username, message, stamp FROM ChatLines WHERE chat_id = ? ORDER BY stamp ASC';
        return poolConnection.query(query, [chatID]);
    }
}

module.exports = {addLine, readLines}

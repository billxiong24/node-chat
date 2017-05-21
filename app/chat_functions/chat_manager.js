var connection = require('../database/config.js');
const crypto = require('crypto');

function loadChatLists(req, res, next) {
    //TODO error checking
    connection.establishConnection(function(err){})
}

function loadChat(username, chatID, res) {
    connection.establishConnection(function(err) {});
    var query = 'SELECT Chat.code, Chat.chat_name FROM Chat, MemberOf WHERE MemberOf.username = ? AND MemberOf.chat_id = ?';
    connection.execute(query, [username, chatID], function(err, rows) {
        if(err) {
            throw err;
        }
        //user did not enter the code, can't access the room
        if(rows.length == 0) {
            res.render('home');
        }
        else {
            var info = {
                id: chatID,
                name: rows[0].chat_name,
                code: rows[0].code
            };
            res.render('chat', info);
        }
    });
}

function createChat(res, chatName, username) {
    connection.establishConnection(function(err){});
    var chatInfo = {
        id: crypto.randomBytes(8).toString('hex'),
        chat_name: chatName,
        code: crypto.randomBytes(3).toString('hex')
    };

    connection.executeTransaction(function(conn, err) {
            if(err) {
                throw err;
            }
            conn.query('INSERT INTO Chat SET ?', chatInfo, function(err, res) {
                if(err) {
                    conn.rollback(function() {
                        throw err;
                    });
                }

                conn.query('INSERT INTO MemberOf SET ?', {chat_id: chatInfo.id, username}, function(err, res) {
                    if(err) {
                        conn.rollback(function() {throw err;});
                    }

                    /* On commit, everything is saved to disk, success*/
                    conn.commit(function(err) {
                        if(err) {
                            conn.rollback(function() {throw err;});
                        }
                    });
                });
            });
        });

    return chatInfo;
}


module.exports = {loadChatLists, createChat, loadChat};

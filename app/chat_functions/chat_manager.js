var connection = require('../database/config.js');
const crypto = require('crypto');

function loadChatLists(req, res, next) {
    //TODO error checking
    connection.establishConnection(function(err){})
}

function joinChat(members, username, chatCode, res) {
    connection.establishConnection(function(err) {});
    connection.executeTransaction(function(conn, err) {
        if(err) {
            throw err;
        }
        conn.query('SELECT * FROM Chat WHERE Chat.code = ?', [chatCode], function(err, rows) {
            if(err) {
                conn.rollback(function() {
                    throw err;
                });
            }
            if(rows.length == 0) {
                //TODO send error message
                res.redirect('/home');
                return;
            }
            var store = rows[0];
            
            //If key exists, ignore insert
            conn.query('INSERT IGNORE INTO MemberOf SET ?', {chat_id: rows[0].id, username}, function(err, rows) {
                if(err) {
                    conn.rollback(function() {throw err;});
                }

                //On commit, everything is saved to disk, success
                conn.commit(function(err) {
                    if(err) {
                        conn.rollback(function() {throw err;});
                    }
                    //TODO abstract into object
                    members[store.id] = {
                        id: store.id,
                        name: store.chat_name,
                        code: store.code,
                        username: username
                    };
                    res.redirect('/chats/' + store.id);
                });
            });
        });

    });
}

function loadChat(members, username, chatID, res) {
    connection.establishConnection(function(err) {});
     var query = 'SELECT Chat.code, Chat.chat_name FROM Chat JOIN MemberOf ON Chat.id = MemberOf.chat_id AND MemberOf.username = ? AND MemberOf.chat_id = ?';
    connection.execute(query, [username, chatID], function(err, rows) {
        if(err) {
            throw err;
        }
        //user did not enter the code, can't access the room
        if(rows.length == 0) {
            res.render('home');
        }
        else {
            //TODO cache into req.session.members, abstract into object
            var info = {
                id: chatID,
                name: rows[0].chat_name,
                code: rows[0].code,
                username: username
            };
            members[info.id] = info;
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
            conn.query('INSERT INTO Chat SET ?', chatInfo, function(err, rows) {
                if(err) {
                    conn.rollback(function() {
                        throw err;
                    });
                }

                conn.query('INSERT INTO MemberOf SET ?', {chat_id: chatInfo.id, username}, function(err, rows) {
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


module.exports = {loadChatLists, createChat, loadChat, joinChat};

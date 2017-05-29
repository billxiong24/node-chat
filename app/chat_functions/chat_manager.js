var connection = require('../database/config.js');
const crypto = require('crypto');
var sql = require('promise-mysql');

//TODO use async library to make things more asynchronous

function loadChatLists(userObj, res) {
    //TODO error checking
    var query = 'SELECT Chat.chat_name, Chat.id, Notifications.num_notifications, MemberOf.username FROM Chat INNER JOIN MemberOf ON Chat.id = MemberOf.chat_id INNER JOIN Notifications ON Chat.id = Notifications.chat_id WHERE MemberOf.username = ? AND Notifications.username = ?';

    connection.execute(query, [userObj.username, userObj.username], function(rows) {
        var info = {
            username: userObj.username,
            first: userObj.first,
            last: userObj.last,
            list: rows
        };
        res.render('home', info);
    });
}

function joinChat(members, username, chatCode, res) {

    var connect;
    var startTrans = function(poolConnection) {
        connect = poolConnection;
        poolConnection.query('START TRANSACTION');
        return poolConnection;
    };

    var retrieveChat = function(poolConnection) {
        return poolConnection.query('SELECT * FROM Chat WHERE Chat.code = ?', [chatCode]);
    };

    var validateChat = function(result) {
        if(result.length == 0) {
            res.redirect('/home');
            return null;
        }
        return result[0];
    };

    var insertMembers = function(result) {
        if(result == null) {
            return null;
        }

        connect.query('INSERT IGNORE INTO MemberOf SET ?', {chat_id: result.id, username});
        return result;
    };

    var sessionStore = function(result) {
        if(result == null) {
            return null;
        }
        connect.query('COMMIT');
        connection.release(connect);

        members[result.id] = {
            id: result.id,
            name: result.chat_name,
            code: result.code,
            username: username,
            notifs: 0
        };
        res.redirect('/chats/' + result.id);
    };

    var err = function(err) {
        connect.query('ROLLBACK');
        console.log(err);
    };

    connection.executePoolTransaction([startTrans, retrieveChat, validateChat, insertMembers, sessionStore], err);

}

function loadChat(members, username, chatID, res) {
    var query = 'SELECT Chat.code, Chat.chat_name, Notifications.num_notifications FROM Chat JOIN MemberOf JOIN Notifications ON Chat.id = MemberOf.chat_id AND MemberOf.username = ? AND MemberOf.chat_id = ? AND Notifications.chat_id = ? AND Notifications.username = ?'
    connection.execute(query, [username, chatID, chatID, username], function(rows) {
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
                username: username,
                notifs: rows[0].num_notifications
            };
            members[info.id] = info;
            res.render('chat', info);
        }
    });
}

function createChat(res, members, chatName, username) {
    var chatInfo = {
        id: crypto.randomBytes(8).toString('hex'),
        chat_name: chatName,
        code: crypto.randomBytes(3).toString('hex')
    };

    var conn;
    var startTrans = function(poolConnection) {
        conn = poolConnection;
        poolConnection.query('START TRANSACTION');
        return poolConnection;
    };
    var insertChat = function(poolConnection) {
        poolConnection.query('INSERT INTO Chat SET ?', chatInfo);
        return poolConnection;
    };

    var insertMember = function(poolConnection) {
        poolConnection.query('INSERT INTO MemberOf SET ?', {chat_id: chatInfo.id, username});
        return poolConnection;
    };

    var commit = function(poolConnection) {
        poolConnection.query('COMMIT');
        connection.release(poolConnection);

        chatInfo.name = chatInfo.chat_name;
        chatInfo.notifs = 0;
        //add to chat members
        members[chatInfo.id] = chatInfo;

        res.redirect('/chats/' + chatInfo.id);
    };

    var err = function(err) {
        conn.query('ROLLBACK');
        console.log(err);
    };

    connection.executePoolTransaction([startTrans, insertChat, insertMember, commit], err);
    return chatInfo;
}


module.exports = {loadChatLists, createChat, loadChat, joinChat};

const connection = require('../database/config.js');
const crypto = require('crypto');
const sql = require('promise-mysql');
const lines = require('./chat_line.js');
const notifs = require('./notifs.js');

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
    var obj = {
        chatResults : null,
        notifResults : null
    };
    var conn = null;

    var getChat = function(poolConnection) {
        conn = poolConnection;
        return poolConnection.query('SELECT Chat.code, Chat.chat_name FROM Chat JOIN MemberOf ON Chat.id = MemberOf.chat_id AND MemberOf.username = ? AND MemberOf.chat_id = ?', [username, chatID]);
    };

    var transferChat = function(result) {
        obj['chatResults'] = (result.length == 0) ? null : result[0];
        return conn;
    };

    var getNotifs = notifs.retrieveNotifications(username, chatID);

    var transferNotifs = function(result) {
        obj['notifResults'] = (result.length == 0) ? null : result[0];
        return conn;
    };

    var getLines = lines.readLines(chatID);

    var transport = function(lineResults) {
        if(obj.chatResults == null) {
           //TODO add error message here
           res.redirect('/home');
        }
        else {
            var info = {
                id: chatID,
                name: obj.chatResults.chat_name,
                code: obj.chatResults.code,
                username: username,
                notifs: obj.notifResults.num_notifications,
                lines: lineResults
            };
            members[info.id] = info;
            res.render('chat', info);
        }
    };

    connection.executePoolTransaction([getChat, transferChat, getNotifs, transferNotifs, getLines, transport], function(err) { 
        throw err; 
    });
}

function createChat(res, members, chatName, username) {
    var chatInfo = {
        id: crypto.randomBytes(8).toString('hex'),
        chat_name: chatName,
        code: crypto.randomBytes(3).toString('hex')
    };

    var conn = null;
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

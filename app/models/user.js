var logger = require('../../util/logger.js')(module);
const connection = require('../database/config.js');

var User = function User(username, id=undefined, password=undefined, first=undefined, last=undefined, email=undefined) {
    this._id = id;    
    this._username = username;    
    this._password = password;    
    this._first = first;    
    this._last = last;    
    this._email = email;

    /*
     *Getters
     */
};

User.prototype.getEmail = function() {
    return this._email;
};
User.prototype.getID = function() {
    return this._id;
};
User.prototype.setID = function(id) {
    this._id = id;
    return this;
};

User.prototype.getUsername = function() {
    return this._username;
};

User.prototype.setUsername = function(username) {
    this._username = username;
    return this;
};

User.prototype.getFirst = function() {
    return this._first;
};

User.prototype.getLast = function() {
    return this._last;
};

User.prototype.getPassword = function() {
    return this._password;
};

User.prototype.setPassword = function(password) {
    this._password = password;
    return this;
};

User.prototype.setEmail = function(email) {
    this._email = email;
    return this;
};

User.prototype.toJSON = function() {
    return {
        username: this._username,
        id: this._id,
        password: this._password,
        first: this._first,
        last: this._last,
        email: this._email
    }; 
};

User.prototype.setJSON = function(userJSON) {
    this._username = userJSON.username;
    this._id = userJSON.id;
    this._first = userJSON.first;
    this._last = userJSON.last;
    this._email = userJSON.email;
    return this;
};

User.prototype.read = function() {
    var username = this._username;
    return function(poolConnection) {
        var query = "SELECT User.id, User.email, User.password,"+
            "User.username, User.first, User.last, EmailConfirm.confirmed, "+ 
            "EmailConfirm.hash from User LEFT JOIN EmailConfirm ON User.username = EmailConfirm.username WHERE User.username = ?";
        return poolConnection.query(query, [username]);
    };
};

User.prototype.insert = function() {
};

User.prototype.flush = function() {

};

User.prototype.leaveChat = function(chat_id, callback) {
    var username = this._username;
    connection.execute('DELETE FROM MemberOf WHERE username = ? AND chat_id = ?', [username, chat_id], function(rows) {
        logger.info("removed " + username + " from chat " + chat_id);
        callback(rows);

    }, function(err) {
        logger.error(err);
    });
};



module.exports = User;

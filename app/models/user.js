const connection = require('../database/config.js');

var User = function User(username, id=undefined, password=undefined, first=undefined, last=undefined) {
    this._id = id;    
    this._username = username;    
    this._password = password;    
    this._first = first;    
    this._last = last;    

    /*
     *Getters
     */
};

User.prototype.getID = function() {
    return this._id;
};

User.prototype.getUsername = function() {
    return this._username;
};

User.prototype.getFirst = function() {
    return this._first;
};

User.prototype.getLast = function() {
    return this._last;
};

User.prototype.toJSON = function() {
    return {
        username: this._username,
        id: this._id,
        password: this._password,
        first: this._first,
        last: this._last
    }; 
};


module.exports = User;

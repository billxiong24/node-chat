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
    this.getID = function() {
        return this._id;
    };

    this.getUsername = function() {
        return this._username;
    };

    this.getFirst = function() {
        return this._first;
    };
    
    this.getLast = function() {
        return this._last;
    };

    this.toJSON = function() {
        return {
            username: this._username,
            id: this._id,
            password: this._password,
            first: this._first,
            last: this._last
        }; 
    };
};



module.exports = User;

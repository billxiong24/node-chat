require('dotenv').config({path: __dirname + '/../../.env'});
var logger = require('../../util/logger.js')(module);
var UserStat = require('../models/user_stat.js');

var UserStatManager = function(userStatObj) {
    this._userStatObj = userStatObj;
};

UserStatManager.prototype.getStats = function(callback) {
    var that = this;
    return this._userStatObj.getNumLines().then(function(counts) {
        return that._userStatObj.getUpVotes().then(function(result) {
            return callback(counts, result);
        });
    });
};

module.exports = UserStatManager;

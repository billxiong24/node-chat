require('dotenv').config({path: __dirname + '/../../.env'});

var UserStatManager = function(userStatObj) {
    this._userStatObj = userStatObj;
};

UserStatManager.prototype.getStats = function(chat_id, callback) {
    return this._userStatObj.getNumLines(chat_id).then(function(counts) {
        return userstat.getUpVotes('019274b44a472600').then(function(result) {
            return callback(counts, result);
        });
    });
};

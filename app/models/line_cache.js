const Line = require('./line.js');
const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');
const microutil = require('../chat_functions/util/microutil.js');

var LineCache = function LineCache(chat_id=null, username=null, message=null, line_id=null) {

    Line.call(this, chat_id, username, message, line_id);
};

//hierarchy
LineCache.prototype = Object.create(Line.prototype);
LineCache.prototype.constructor = LineCache;

LineCache.prototype.insert = function(callback=function(err, result) {}) {
    var that = this;
    if(!this.getChatID() || !this.getUsername() || !this.getLineID()) {
        //TODO maybe throw custom exception
        return null;

    }
    var lineObj = Line.prototype.toJSON.call(this);
    lineObj.stamp = microutil.composeStampNow();
    cache_functions.pushMessage(Line.prototype.getChatID.call(that), [JSON.stringify(lineObj)], callback);
};

//TODO test this method, it most likely does not work
LineCache.prototype.flush = function(numMessages, callback=function(rows) {}) {
    var that = this;
    cache_functions.popMessage(Line.prototype.getChatID.call(that), numMessages, function(err, message) {
        var query = "INSERT INTO ChatLines (chat_id, username, message, stamp, line_id) VALUES ";
        var jsonArr = [];
        var first = true;
        //even though looks ratchet, query is protected against sql injection bc still executing parameterized queries
        for(var i = 0; i < numMessages; i++) {
            var jsonObj = JSON.parse(message[i]);
            //if false, that means the queue of messages is empty, break
            if(!jsonObj) { break; }
            else {
                if(!first) {
                    query += ",";
                }
                first = false;
                query += "(?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s:%f'), ?)";
                jsonArr = jsonArr.concat([jsonObj.chat_id, jsonObj.username, jsonObj.message, jsonObj.stamp, jsonObj.line_id]);
            }
        }
        //if we never entered loop, nothing to insert
        if(!first) {
            connection.execute(query, jsonArr, function(rows) {
                callback(rows);
                console.log("flushed to database");
            });
        }
    });
};

LineCache.prototype.read = function() {
    //call super method for now
    return Line.prototype.read.call(this);
};

LineCache.prototype.readNext = function(latestStamp, callback) {
    //call super method for now
    Line.prototype.readNext.call(this, latestStamp, callback);
};


module.exports = LineCache;

const Line = require('./line.js');
const connection = require('../database/config.js');
const cache_functions = require('../cache/cache_functions.js');

var LineCache = function LineCache(chat_id=null, username=null, message=null, line_id=null) {

    Line.call(this, chat_id, username, message, line_id);

    this.insert = function() {
        //TODO should write to disk at some point, for now just write cache
        //TODO handle timestamp
        var that = this;
        var lineObj = this.toJSON();
        //need another way to get microsecond time accuracy
        connection.execute('SELECT DATE_FORMAT(NOW(6), "%Y-%m-%d %H:%i:%s:%f") as stamp', [], function(row) {
            lineObj.stamp = row[0].stamp;
            cache_functions.pushMessage(that.getChatID(), [JSON.stringify(lineObj)], function(err, reply) {});
        });
    };

    //this fucking hack lmao
    var oldRead = this.read;
    this.read = function() {
        return oldRead.call(this);
    };
    
    var oldReadNext = this.readNext;
    this.readNext = function(latestStamp, callback) {
        oldReadNext.call(this, latestStamp, callback);
    };
};

LineCache.prototype = Line.prototype;
LineCache.prototype.constructor = LineCache;

module.exports = LineCache;

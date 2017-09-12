var logger = require('../../util/logger.js')(module);
var search_client = require('./search_config.js');

var SearchManager = function(index, type) {
    this._index = index;
    this._type = type;
    this._client = search_client;
};

SearchManager.prototype.getIndex = function() {
    return this._index;
};

SearchManager.prototype.getType = function() {
    return this._type;
};

SearchManager.prototype.getClient = function() {
    return this._client;
}; 
SearchManager.prototype.createBulkIndex = function(data, callback) {
    var bulkArr = [];
    var that = this;

    data.forEach(function(element) {
        bulkArr.push({
            index: {
                _id: element.id,
                _type: that._type,
                _index: that._index
            }
        });

        bulkArr.push(element);
    });

    search_client.bulk({
        body: bulkArr
    }).then(function(res) {
        callback(res);

    }).catch(function(err) {
        //TODO error handle
        logger.error(err);
    });
};

SearchManager.prototype.createDocument = function(infoObj, callback) {
    //TODO override in subclass
};

SearchManager.prototype.incrementField = function(id, field, incrementBy, callback) {
    var upsertObj = {};
    upsertObj[field] = 1;
    var that = this;

    search_client.update({
        index: that._index,
        type: that._type,
        id: id,
        body: {
            script: 'ctx._source.'+field+'+=' + incrementBy,
            upsert: upsertObj 
        }
    }, function(err, res) {

        callback(err, res);
    });
};

SearchManager.prototype.update = function(id, field, value, callback) {
    var obj = {};
    obj[field] = value;
    var that = this;

    search_client.update({
        index: that._index,
        type: that._type,
        id: id,
        body: {
            doc: obj
        }
    }, function(err, response) {
        callback(err, response);
    });
};

//NOTE expect this functionality to be overriden in subclasses
SearchManager.prototype.search = function(searchTerm, callback) {};

module.exports = SearchManager;

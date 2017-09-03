//var Pic = require('../models/pic.js');
var logger = require('../../util/logger.js')(module);

var PicManager = function(picObj) {
    this._pic = picObj;
};

PicManager.prototype.storeImage = function(id, file_name, file_buffer) {
    return this._pic.savePic(id, file_name, file_buffer);
};

PicManager.prototype.loadImage = function(id) {
    return this._pic.loadPic(id).then(function(data) {
        logger.info('url is here', data);
        return data;
    });
};

module.exports = PicManager;

require('dotenv').config({page: __dirname + '/../../.env'});
var logger = require('../../util/logger.js')(module);
var AWS = require('aws-sdk');
var connection = require('../database/config.js');
//add promise support to aws-sdk functions
AWS.config.setPromisesDependency(require('bluebird'));

var Pic = function() {
    setConfig();
    this._extensions = ['png', 'jpg', 'jpeg'];
    this._bucket = 'scrible';
    this._s3 = new AWS.S3();
};

Pic.prototype.getURL = function(key) {
    //return "https://scrible.s3.amazonaws.com/" + key;
    return "https://s3.us-east-2.amazonaws.com/scrible/" + key;
};

Pic.prototype.savePic = function(id, file_name, file_buffer) {
    var extension = file_name.split('.').pop().toLowerCase();
    if(this._extensions.indexOf(extension) < 0) {
        //throw some exception
        throw new Error("Wrong file format");
    }
    var params = {
        Bucket: this._bucket,
        Key: id + "/profile_pic.png",
        ACL: 'public-read',
        Body: file_buffer
    };
    var that = this;
    return this._s3.upload(params).promise().then(function(data) {
        return data;
        //return connection.executePromise('UPDATE User SET profile_url=? WHERE username=? ', [id, that.getURL(params.Key)]);
    });
};

Pic.prototype.loadPic = function(id) {
    var urlParams = {
        Bucket: this._bucket,
        Delimiter: '/',
        Prefix: id + '/'
    };

    var that = this;

    return new Promise(function(resolve,reject) {
         that._s3.listObjects(urlParams, function(err, data) { 
             if(err) {
                 return reject(err);
             }
             if(!data || data.Contents.length === 0) {
                 resolve({});
             }
             else {
                 data.url = that.getURL(data.Contents[0].Key);
                 resolve(data);
             }
         });
    });
};

function setConfig() {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS,
        secretAccessKey: process.env.AWS_SEC
    });
}



module.exports = Pic;

require('dotenv').config({page: __dirname + '/../../.env'});
var AWS = require('aws-sdk');
//add promise support to aws-sdk functions
AWS.config.setPromisesDependency(require('bluebird'));

var Pic = function() {
    this._bucket = 'scrible';
    this._s3 = new AWS.S3();
};

Pic.prototype.savePic = function(id, file_name, file_buffer) {
    setConfig();
    var params = {
        Bucket: this._bucket,
        Key: id + "/" + file_name,
        ACL: 'public-read',
        Body: file_buffer
    };
    return this._s3.upload(params).promise();
    //prom.then(function(data) {
        //logger.info(data);
    //});
};

Pic.prototype.loadPic = function(id) {
    setConfig();
    var urlParams = {
        Bucket: this._bucket,
        Key: id + '/' + "18279952_1503824712963832_701908839_n.jpg"
    };

    var that = this;

    return new Promise(function(resolve,reject) {
         that._s3.getSignedUrl('getObject', urlParams, function(err, url) { 
             if(err) {
                 return reject(err);
             }
             resolve(url); 
         });
    });

    //p.then(function(url) {
        //logger.info('url is here', url);
    //});
};



function setConfig() {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS,
        secretAccessKey: process.env.AWS_SEC
    });
}


module.exports = Pic;

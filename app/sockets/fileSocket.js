require('dotenv').config({path: __dirname + '/../../.env'});
var logger = require('../../util/logger.js')(module);
var Socket = require('./socket.js');
var deliv = require('delivery');
var AWS = require('aws-sdk');
AWS.config.setPromisesDependency(require('bluebird'));

var FileSocket = function(io, namespace) {
    Socket.call(this, io, namespace);
};

FileSocket.prototype = Object.create(Socket.prototype);
FileSocket.prototype.constructor = FileSocket;

//override
FileSocket.prototype.init = function() {
    var that = this;
    this.addOnConnectionListener(function(socket) {
        var delivery = deliv.listen(socket);
        delivery.on('receive.success', function(file) {
            
            AWS.config.update({
                accessKeyId: process.env.AWS_ACCESS,
                secretAccessKey: process.env.AWS_SEC
            });
            var s3 = new AWS.S3();
            var id = socket.request.session.user.id;
            var params = {
                Bucket: 'scrible',
                Key: id + "/" + file.name,
                ACL: 'public-read',
                Body: file.buffer
            };
            var urlParams = {
                Bucket: 'scrible',
                Key: id + '/' + "18279952_1503824712963832_701908839_n.jpg"
            };

            //var p = new Promise(function(resolve,reject) {
                 //s3.getSignedUrl('getObject', urlParams, function(err, url) { 
                     //if(err) {
                         //return reject(err);
                     //}
                     //resolve(url); 
                 //});
            //});
            //p.then(function(url) {
                //logger.info('url is here', url);
            //});

            var prom = s3.upload(params).promise();
            prom.then(function(data) {
                logger.info(data);
            });
        });
    });
};

module.exports = FileSocket;

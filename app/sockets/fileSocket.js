require('dotenv').config({path: __dirname + '/../../.env'});
var logger = require('../../util/logger.js')(module);
var Socket = require('./socket.js');
var deliv = require('delivery');
var AWS = require('aws-sdk');

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
            //TODO using aws to upload file to s3 storage
            //var fs =require('fs');
            //logger.info(file.name);
            //fs.writeFile(file.name, file.buffer, function(err) {
                //if(err) {
                    //logger.error('there was error saving file');
                //}
                //else {
                    //logger.info('file saved successfully', file.name);
                //}
            //});

            AWS.config.update({
                accessKeyId: process.env.AWS_ACCESS,
                secretAccessKey: process.env.AWS_SEC
            });
            var s3 = new AWS.S3();
            var params = {
                Bucket: 'scrible',
                Key: file.name,
                ACL: 'public-read',
                Body: file.buffer

            };

            s3.putObject(params, function(err, data) {
                if(err) {
                    logger.error(err);
                }
                else {
                    logger.info(data);
                }
            });
        });
    });
};

module.exports = FileSocket;

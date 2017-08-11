require('dotenv').config({path: __dirname + '/../../.env'});
var host = process.env.HOST;

module.exports = {
    clusters: [
        {
            port: 6379,
            host: host
        },
        {
            port: 6380,
            host: host
        },
        {
            port: 6381,
            host: host
        }
    ],

    options: {
        scaleReads: 'slave',
        enableOfflineQueue: true
    }
};


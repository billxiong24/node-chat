require('dotenv').config({path: __dirname + '/../../.env'});
const elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
    host: process.env.HOST + ":" + process.env.ES_PORT,
    log: 'error'
});

module.exports = elasticClient;

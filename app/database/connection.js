/**
 * Establishes connection to database using node-mysql
 */
const mysql = require('mysql')
var promise_sql = require('promise-mysql');

var connection = null;
var pool = null;

function getPool(host, user, password, connectionLim) {
    pool = promise_sql.createPool({
        host: host,
        user: user,
        password: password,
        database: "chatdb",
        connectionLimit: connectionLim
    });
    return pool;
}


function getConnection(host, user, pass) {
    connection = mysql.createConnection({
        host: host,
        user: user,
        password: pass,
        database: "chatdb"
    });
    return connection;
}

function establishConnection(callback) {
    if(!connection) {
        //throw some error here
        return;
    }

    connection.connect(callback);
}

function endConnection(callback) {
    if(!connection) {
        //throw some error here
        return;
    }

    connection.end(callback);
}

function execute(query, info=null, callback=function(result) {}, error=function(err) {}) {
    pool.getConnection().then(function(connection) {
        var result = connection.query(query, info);
        pool.releaseConnection(connection);
        return result;
    }).then(callback).catch(error);

    //if(!connection) {
        //return;
    //}

    //if(!callback) {
        //return (!info) ? connection.query(query) : connection.query(query, info);
    //}

    ////select query
    //if(!info) {
        //connection.query(query, callback);
    //}
    //else {
        //connection.query(query, info, callback);
    //}
}

function executeTransaction(transaction) {
    connection.beginTransaction(function(err) {
        transaction(connection, err);
    });
}

module.exports = {getPool, getConnection, establishConnection, endConnection, execute, executeTransaction};

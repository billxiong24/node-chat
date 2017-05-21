/**
 * Establishes connection to database using node-mysql
 */
const mysql = require('mysql')
var connection = null;

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

function execute(query, info=null, callback) {
    if(!connection) {
        return;
    }

    //select query
    if(!info) {
        connection.query(query, callback);
    }
    else {
        connection.query(query, info, callback);
    }
}

//temp function
function getConn() {
    return connection;
}

function executeTransaction(transaction) {
    connection.beginTransaction(function(err) {
        transaction(connection, err);
    });
}

module.exports = {getConnection, establishConnection, endConnection, execute, getConn, executeTransaction};

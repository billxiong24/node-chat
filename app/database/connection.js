/**
 * Establishes connection to database using node-mysql
 */
const mysql = require('mysql')
var connection = undefined;

function getConnection(host, user, pass) {
    connection = mysql.createConnection({
        host: host,
        user: user,
        password: pass
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

function execute(query, info=undefined, callback) {
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

modules.export = {getConnection, establishConnection, endConnection, execute}

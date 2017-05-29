/**
 * Establishes connection to database using node-mysql
 * and node-promise-mysql for promises and connection pooling
 */
const mysql = require('mysql')
const promise_sql = require('promise-mysql');

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

function execute(query, info=null, callback=function(result) {}, error=function(err) {}) {
    pool.getConnection().then(function(connection) {
        var result = connection.query(query, info);
        pool.releaseConnection(connection);
        return result;
    }).then(callback).catch(error);
}

//more general form of execute function above
function executePoolTransaction(transactions, error=function(err) {}, info=null) {
    transactions.reduce(function(prevFunc, currFunc) {
        return prevFunc.then(currFunc);
    }, pool.getConnection()).catch(error);
}

function release(connection) {
    pool.releaseConnection(connection);
}

module.exports = {getPool, execute, executePoolTransaction, release};

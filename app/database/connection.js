/**
 * Establishes connection to database using node-mysql
 * and node-promise-mysql for promises and connection pooling
 */
const mysql = require('mysql');
const promise_sql = require('promise-mysql');

var pool = null;

function getPool(host, user, password, database, connectionLim) {
    pool = promise_sql.createPool({
        host: host,
        user: user,
        password: password,
        database: database,
        connectionLimit: connectionLim
    });
    return pool;
}

function execute(query, info=null, callback=function(result) {}, error=function(err) {console.log(err);}) {

    pool.getConnection().then(function(connection) {
        var result = connection.query(query, info);
        release(connection);
        return result;
    }).then(callback).catch(error);
}

//more general form of execute function above
function executePoolTransaction(transactions, error=function(err) {}, info=null) {
    var connected = pool.getConnection();
    //TODO release connection in one place
    var conn = null;
    var setConn = function(poolConnection) {
        conn = poolConnection;
        return conn;
    };
    var releaseConn = function(result) {
        //result doesn matter
        release(conn);
    };

    //transaction.unshift(setConn);
    //transaction.push(releaseConn);

    transactions.reduce(function(prevFunc, currFunc) {
        return prevFunc.then(currFunc).catch(function(err) {
            //when we detect expection, throw it so none of next functions can
            //be executed. This error will be caught at the very end
            //release connection here

            throw err;
        });
    }, connected).catch(error);
}

function release(connection) {
    pool.releaseConnection(connection);
}

module.exports = {getPool, execute, executePoolTransaction, release};

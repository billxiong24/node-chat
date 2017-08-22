var conn = require('./connection.js');
if(process.env.NODE_ENV === 'test') {
    //TODO need to consolidate release connections in connection.js
    conn.getPool(process.env.HOST, process.env.NODE_USER, process.env.PASS, 'chatdbtest', 200);
}
else {
    //NOTE use small connection limit to search for any leaking connections
    conn.getPool(process.env.HOST, process.env.NODE_USER, process.env.PASS, 'chatdb', 3);
}

module.exports = conn;

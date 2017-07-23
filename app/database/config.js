var conn = require('./connection.js');
if(process.env.NODE_ENV === 'test') {
    conn.getPool(process.env.HOST, process.env.NODE_USER, process.env.PASS, 'chatdbtest', 5);
}
else {
    conn.getPool(process.env.HOST, process.env.NODE_USER, process.env.PASS, 'chatdb', 2000);
}
module.exports = conn;

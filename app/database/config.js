var conn = require('./connection.js');
conn.getPool(process.env.HOST, process.env.NODE_USER, process.env.PASS, 200);
module.exports = conn;

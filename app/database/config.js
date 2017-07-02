var conn = require('./connection.js');
conn.getPool(process.env.HOST, process.env.USER, process.env.PASS, 200);
module.exports = conn;

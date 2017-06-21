var conn = require('./connection.js');
//Using 100 pooled connections, idk if too much or little
conn.getPool(process.env.HOST, process.env.USER, process.env.PASS, 100);
module.exports = conn;

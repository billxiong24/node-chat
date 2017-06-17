var conn = require('./connection.js');
//Using 45 pooled connections, idk if too much or little
conn.getPool(process.env.HOST, process.env.USER, process.env.PASS, 45);
module.exports = conn;

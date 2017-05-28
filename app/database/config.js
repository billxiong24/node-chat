var conn = require('./connection.js');
conn.getPool('localhost', 'root', 'Chem1313#', 20);
module.exports = conn;

var conn = require('./connection.js');
conn.getConnection('localhost', 'root', 'Chem1313#');
conn.getPool('localhost', 'root', 'Chem1313#', 20);
module.exports = conn;

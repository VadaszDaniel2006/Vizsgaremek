const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  
    host: process.env.DB_HOST || 'db', 
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'apppw',
   
    database: process.env.DB_DATABASE || 'mozipont_beta',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
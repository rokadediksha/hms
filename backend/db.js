require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createPool({
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB,
  port: process.env.RDS_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection on startup
connection.getConnection((err, conn) => {
  if (err) {
    console.error('❌ AWS RDS connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to AWS RDS MySQL');
    conn.release();
  }
});

module.exports = connection.promise();

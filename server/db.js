const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((error) => {
  if (error) throw error;
  console.log("Connected to MySQL database!");
});

// Create a table
const sql =
  "CREATE TABLE IF NOT EXISTS todo (todo_id  INT AUTO_INCREMENT PRIMARY KEY, description VARCHAR(255))";
connection.query(sql, (err, result) => {
  if (err) throw err;
  console.log("Table created successfully");
});

module.exports = connection;

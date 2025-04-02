import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// สร้าง Connection Pool แบบ Promise
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "db_project",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;

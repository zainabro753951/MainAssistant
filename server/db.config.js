import dotenv from 'dotenv'
dotenv.config()

import mysql from 'mysql2/promise'

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Session ke liye timezone set
await pool.query("SET time_zone = '+05:00';")
export default pool

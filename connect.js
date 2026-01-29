import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const db = new pg.Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});
db.connect().then(() => {
    console.log("Connected to the database successfully.");
}).catch(err => {
    console.error("Database connection error:", err.stack);
});
export default db;
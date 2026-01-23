import pg from 'pg';
const conn = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'general',
    password: 'yamen123',
    port: 5432,
});
conn.connect().then(() => {
    console.log("Connected to the database successfully.");
}).catch(err => {
    console.error("Database connection error:", err.stack);
});

const { Client } = require('pg');

// Database configuration
const con = new Client({
    host: "localhost",
    user: "postgres",
    port: 1234,
    password: "1234",
    database: ".GEN" 
});

con.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => console.error('Connection error', err.stack));
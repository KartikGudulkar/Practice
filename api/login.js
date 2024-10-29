const express = require('express');
const { Client } = require('pg');
const router = express.Router();

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

// Route to login a user
router.post('/', (req, res) => {
    const { username, password } = req.body;

    const selectQuery = `
        SELECT * FROM users WHERE username = $1 AND password = $2
    `;
    const values = [username, password];

    con.query(selectQuery, values)
        .then(result => {
            if (result.rowCount === 0) {
                return res.status(401).send("Invalid username or password");
            }
            res.status(200).send("Login successful");
        })
        .catch(err => {
            console.error("Error logging in:", err.message);
            res.status(500).send("Error logging in");
        });
});

module.exports = router;

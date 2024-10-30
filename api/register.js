const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const router = express.Router();
const app = express();

app.use(express.json()); // Middleware for JSON parsing
app.use(bodyParser.json());

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
// Route to handle registration
router.post('/', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send('All fields are required');
    }

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Check if the user already exists
        const userCheckQuery = 'SELECT * FROM users WHERE email = $1';
        const userCheckResult = await con.query(userCheckQuery, [email]);

        if (userCheckResult.rowCount > 0) {
            return res.status(400).send('Email already in use');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const insertQuery = `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING *`;
        const values = [name, email, hashedPassword];
        const result = await con.query(insertQuery, values);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting data:', err.message);
        res.status(500).send('Error inserting data');
    }
});

module.exports = router;
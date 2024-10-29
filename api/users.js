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

// Route to fetch all users
router.get('/', (req, res) => {
    con.query('SELECT * FROM users')
        .then(result => res.status(200).json(result.rows))
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Route to update a user by user_id
router.put('/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { fullname, email, password, phone } = req.body;

    const updateQuery = `
        UPDATE users 
        SET 
            fullname = COALESCE($1, fullname),
            email = COALESCE($2, email),
            password = COALESCE($3, password),
            phone = COALESCE($4, phone)
        WHERE user_id = $5
        RETURNING *;
    `;

    const values = [fullname, email, password, phone, user_id];

    con.query(updateQuery, values)
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('User not found');
            res.status(200).json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error updating data:', err);
            res.status(500).send('Error updating data');
        });
});

// Route to delete a user by user_id
router.delete('/:user_id', (req, res) => {
    const { user_id } = req.params;
    const deleteQuery = 'DELETE FROM users WHERE user_id = $1';

    con.query(deleteQuery, [user_id])
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('User not found');
            res.status(200).send('User deleted successfully');
        })
        .catch(err => {
            console.error('Error deleting user:', err);
            res.status(500).send('Error deleting user');
        });
});

module.exports = router;

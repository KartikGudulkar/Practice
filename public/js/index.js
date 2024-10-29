const express = require('express');
const path = require('path');
const engine = require('express-edge');
const { Client } = require('pg');

const app = express();
app.use(express.json()); // Middleware for JSON parsing

// Set up Edge as the view engine
app.use(engine);
app.set('views', path.join(__dirname, 'views')); // Path for the views

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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

// Render routes for .edge pages
app.get('/', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));
app.get('/shop', (req, res) => res.render('shop'));

// CRUD routes for 'users'

// Route to insert user data
app.post('/users', (req, res) => {
    const { user_id, username, email, password, phone, address, date_of_birth, created_at, last_login } = req.body;
    const insertQuery = `
        INSERT INTO users (user_id, username, email, password, phone, address, date_of_birth, created_at, last_login) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [user_id, username, email, password, phone, address, date_of_birth, created_at, last_login];

    con.query(insertQuery, values)
        .then(result => {
            console.log("Data inserted successfully:", result);
            res.status(201).send("Data inserted successfully");
        })
        .catch(err => {
            console.error("Error inserting data:", err.message);
            res.status(500).send("Error inserting data");
        });
});

// Route to fetch all users
app.get('/users', (req, res) => {
    con.query('SELECT * FROM users')
        .then(result => res.status(200).json(result.rows))
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Route to update a user by user_id
app.put('/users/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { username, email, password, phone, address, date_of_birth, last_login } = req.body;

    const updateQuery = `
        UPDATE users 
        SET 
            username = COALESCE($1, username),
            email = COALESCE($2, email),
            password = COALESCE($3, password),
            phone = COALESCE($4, phone),
            address = COALESCE($5, address),
            date_of_birth = COALESCE($6, date_of_birth),
            last_login = COALESCE($7, last_login)
        WHERE user_id = $8
        RETURNING *;
    `;

    const values = [username, email, password, phone, address, date_of_birth, last_login, user_id];

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
app.delete('/users/:user_id', (req, res) => {
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


// Start the server and listen on port 3000
app.listen(3000, () => console.log('App listening on port 3000'));

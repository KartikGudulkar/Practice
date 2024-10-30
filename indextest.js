const express = require('express');
const { Client } = require('pg');
const app = express();
const router = express.Router();
const port = 3000;

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

// Middleware to parse JSON
app.use(express.json());

// Route to get all products
router.get('/products', (req, res) => {
    con.query('SELECT * FROM products')
        .then(result => res.status(200).json(result.rows))
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Route to get a single product by ID
router.get('/products/:id', (req, res) => {
    const { id } = req.params;
    con.query('SELECT * FROM products WHERE id = $1', [id])
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Product not found');
            res.status(200).json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Use router for product endpoints
app.use('/api', router);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

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

// Route to get all products
router.get('/', (req, res) => {
    con.query('SELECT * FROM products')
        .then(result => res.status(200).json(result.rows))
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Route to get a single product by ID
router.get('/:id', (req, res) => {
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

// Route to add multiple products
router.post('/', (req, res) => {
    console.log('Request body:', req.body); // Log full request body for debugging

    const products = req.body;

    if (!Array.isArray(products)) {
        return res.status(400).send('Request body must be an array of products');
    }

    const insertQuery = `
        INSERT INTO products (product_id, name, description, price, stock, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`;

    const promises = products.map(product => {
        const { product_id, name, description, price, stock, created_at } = product;

        // Detailed validation for each product
        if (product_id === undefined || typeof product_id !== 'number') {
            console.error('Invalid or missing product_id:', product_id); // Log specific error
            return Promise.reject(new Error('Invalid or missing product_id'));
        }
        if (!name || typeof name !== 'string') {
            return Promise.reject(new Error('Invalid or missing name'));
        }
        if (price === undefined || typeof price !== 'number') {
            return Promise.reject(new Error('Invalid or missing price'));
        }
        if (stock === undefined || typeof stock !== 'number') {
            return Promise.reject(new Error('Invalid or missing stock'));
        }

        const values = [product_id, name, description, price, stock, created_at];

        return con.query(insertQuery, values)
            .then(result => result.rows[0])
            .catch(err => {
                console.error('Error inserting data:', err.message);
                throw new Error(`Error inserting data: ${err.message}`);
            });
    });

    Promise.all(promises)
        .then(results => res.status(201).json(results))
        .catch(err => res.status(500).send(`Error inserting data: ${err.message}`));
});

// Route to update a product by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    const updateQuery = 'UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *';
    const values = [name, price, id];

    con.query(updateQuery, values)
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Product not found');
            res.status(200).json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error updating data:', err);
            res.status(500).send('Error updating data');
        });
});

// Route to delete a product by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM products WHERE id = $1';

    con.query(deleteQuery, [id])
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Product not found');
            res.status(200).send('Product deleted successfully');
        })
        .catch(err => {
            console.error('Error deleting product:', err);
            res.status(500).send('Error deleting product');
        });
});

module.exports = router;

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

// Route to get all orders
router.get('/', (req, res) => {
    con.query('SELECT * FROM orders')
        .then(result => res.status(200).json(result.rows))
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Route to get a single order by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    con.query('SELECT * FROM orders WHERE id = $1', [id])
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Order not found');
            res.status(200).json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Route to add a new order
router.post('/', (req, res) => {
    const { user_id, product_id, quantity, total_price, order_date } = req.body;
    const insertQuery = 'INSERT INTO orders (user_id, product_id, quantity, total_price, order_date) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [user_id, product_id, quantity, total_price, order_date];

    con.query(insertQuery, values)
        .then(result => res.status(201).json(result.rows[0]))
        .catch(err => {
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data');
        });
});

// Route to update an order by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { user_id, product_id, quantity, total_price, order_date } = req.body;
    const updateQuery = 'UPDATE orders SET user_id = $1, product_id = $2, quantity = $3, total_price = $4, order_date = $5 WHERE id = $6 RETURNING *';
    const values = [user_id, product_id, quantity, total_price, order_date, id];

    con.query(updateQuery, values)
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Order not found');
            res.status(200).json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error updating data:', err);
            res.status(500).send('Error updating data');
        });
});

// Route to delete an order by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM orders WHERE id = $1';

    con.query(deleteQuery, [id])
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Order not found');
            res.status(200).send('Order deleted successfully');
        })
        .catch(err => {
            console.error('Error deleting order:', err);
            res.status(500).send('Error deleting order');
        });
});

module.exports = router;

const express = require('express');
const { Client } = require('pg');

const router = express.Router();

// Route to get all categories
router.get('/', (req, res) => {
    con.query('SELECT * FROM categories')
        .then(result => res.status(200).json(result.rows))
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Route to get a single category by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    con.query('SELECT * FROM categories WHERE id = $1', [id])
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Category not found');
            res.status(200).json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});

// Route to add a new category
router.post('/', (req, res) => {
    const { name, description } = req.body;
    const insertQuery = 'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *';
    const values = [name, description];

    con.query(insertQuery, values)
        .then(result => res.status(201).json(result.rows[0]))
        .catch(err => {
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data');
        });
});

// Route to update a category by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const updateQuery = 'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *';
    const values = [name, description, id];

    con.query(updateQuery, values)
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Category not found');
            res.status(200).json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error updating data:', err);
            res.status(500).send('Error updating data');
        });
});

// Route to delete a category by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM categories WHERE id = $1';

    con.query(deleteQuery, [id])
        .then(result => {
            if (result.rowCount === 0) return res.status(404).send('Category not found');
            res.status(200).send('Category deleted successfully');
        })
        .catch(err => {
            console.error('Error deleting category:', err);
            res.status(500).send('Error deleting category');
        });
});

module.exports = router;

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();

app.use(express.json()); // Middleware for JSON parsing
app.use(bodyParser.json());

app.use(bodyParser.json());

let cart = [];

// Get all items in the cart
app.get('/cart', (req, res) => {
    res.json(cart);
});

// Add an item to the cart
app.post('/cart', (req, res) => {
    const { name, price, quantity } = req.body;
    const item = { name, price, quantity, total: price * quantity };
    cart.push(item);
    res.status(201).json(item);
});

// Update an item in the cart
app.put('/cart/:name', (req, res) => {
    const { name } = req.params;
    const { price, quantity } = req.body;
    const item = cart.find(i => i.name === name);
    if (item) {
        item.price = price;
        item.quantity = quantity;
        item.total = price * quantity;
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Remove an item from the cart
app.delete('/cart/:name', (req, res) => {
    const { name } = req.params;
    cart = cart.filter(i => i.name !== name);
    res.status(204).end();
});

// Checkout
app.post('/checkout', (req, res) => {
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    cart = [];
    res.json({ message: `Your order total is $${total.toFixed(2)}` });
});

module.exports = router;
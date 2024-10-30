const express = require('express');
const bcrypt = require('bcrypt'); // Import bcrypt
const router = express.Router();


// Route to login a user
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const selectQuery = 'SELECT * FROM users WHERE email = $1';
        const userCheckResult = await con.query(selectQuery, [email]);

        if (userCheckResult.rowCount === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = userCheckResult.rows[0];

        // Compare the hashed password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        console.error("Error logging in:", err.message);
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
});

module.exports = router;

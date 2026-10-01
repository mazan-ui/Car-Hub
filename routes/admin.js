const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// admin login - username and password come from the .env file
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
    return res.status(401).json({ message: 'Wrong username or password' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;

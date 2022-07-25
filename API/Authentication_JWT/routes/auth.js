const express = require('express');
const db = require('../lib/db');
const user = require('../lib/user');

const router = express.Router();

router.get('/', (req, res) => {
    const result = user(req.body);
    res.json(result);
})

module.exports = router;
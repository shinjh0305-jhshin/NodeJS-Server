const express = require('express');
const router = express.Router();
const db = require('../lib/db');

router.get('/', async (req, res) => {
    const [result] = await db.query('SELECT * FROM users');
    res.send(result);
})

router.post('/', async (req, res) => {
    console.log(req.params);
    const user_id = req.body.user_id;
    const date = new Date(Date.now());
    const title = req.body.title;
    const content = req.body.content;

    await db.query('INSERT INTO users(user_id, date, title, content) values (?, ?, ?, ?)', [user_id, date, title, content]);

    res.redirect('/board');
})

router.put('/:id', async (req, res) => {
    const boardId = req.params.id;
    const newtitle = req.body.title;
    const newcontent = req.body.content;

    await db.query('UPDATE users SET title=?, date=?, content=? WHERE id=?', [newtitle, new Date(Date.now()), newcontent, boardId]);
    
    res.redirect('/board');
})

router.delete('/:id', async (req, res) => {
    const boardId = req.params.id;
    await db.query('DELETE FROM users WHERE id=?', [boardId]);
    res.redirect('/board');
})

module.exports = router;
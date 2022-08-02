const express = require('express');
const router = express.Router();
const util = require('../lib/util')
const db = require('../lib/db');

router.get('/', async (req, res) => {
    const [result] = await db.query('SELECT * FROM board');
    res.send(result);
})

router.post('/', async (req, res) => {
    if (req.tokenuser.code !== 0 || req.tokenuser.access < 5) {
        return util.sendMessage(1, "Not enough access to POST.", res);
    }
    const user_id = req.tokenuser.user_id;
    const date = new Date(Date.now());
    const title = req.body.title;
    const content = req.body.content;

    await db.query('INSERT INTO board(user_id, date, title, content) values (?, ?, ?, ?)', [user_id, date, title, content]);

    res.redirect('/board');
})

router.put('/:id', async (req, res) => {
    if (req.tokenuser.code !== 0 || req.tokenuser.access < 5) {
        return util.sendMessage(1, "Not enough access to PUT.", res);
    }
    const boardId = req.params.id;
    const newtitle = req.body.title;
    const newcontent = req.body.content;

    await db.query('UPDATE board SET title=?, date=?, content=? WHERE id=?', [newtitle, new Date(Date.now()), newcontent, boardId]);
    
    res.redirect('/board');
})

router.delete('/:id', async (req, res) => {
    if (req.tokenuser.code !== 0 || req.tokenuser.access < 5) {
        return util.sendMessage(1, "Not enough access to DELETE.", res);
    }
    const boardId = req.params.id;
    await db.query('DELETE FROM board WHERE id=?', [boardId]);
    res.redirect('/board');
})

module.exports = router;
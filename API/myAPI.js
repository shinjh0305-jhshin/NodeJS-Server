const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const morgan = require('morgan');

dotenv.config({ path: path.resolve(__dirname, "./.env" )});

const db = mysql.createPool({
    host : process.env.HOST,
    user : process.env.DBUSER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
}).promise();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.set('port', 3000);
app.get('/', (req, res) => {
    res.send (`
        <h1>This is an API(by. JaeHyun Shin)</h1>
    `)
})

app.get('/board', async (req, res) => {
    const [result] = await db.query('SELECT * FROM users');
    res.send(result);
})

app.post('/board', async (req, res) => {
    console.log(req.params);
    const user_id = req.body.user_id;
    const date = new Date(Date.now());
    const title = req.body.title;
    const content = req.body.content;

    const result = await db.query('INSERT INTO users(user_id, date, title, content) values (?, ?, ?, ?)', [user_id, date, title, content]);

    res.redirect('/board');
})

app.put('/board/:id', async (req, res) => {
    const boardId = req.params.id;
    const newtitle = req.body.title;
    const newcontent = req.body.content;

    await db.query('UPDATE users SET title=?, date=?, content=? WHERE id=?', [newtitle, new Date(Date.now()), newcontent, boardId]);
    
    res.redirect('/board');
})

app.delete('/board/:id', async (req, res) => {
    const boardId = req.params.id;
    await db.query('DELETE FROM users WHERE id=?', [boardId]);
    res.redirect('/board');
})

app.listen(app.get('port'), () => {
    console.log(`Server running on ${app.get('port')}`);    
})





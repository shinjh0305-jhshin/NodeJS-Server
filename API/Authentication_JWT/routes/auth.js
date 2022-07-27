const express = require('express');
const path = require('path');
const shortid = require('shortid');
const dotenv = require('dotenv');
const crypto = require('crypto');
const db = require('../lib/db');
const util = require('../lib/util');
const validateInfo = require('../lib/user');

const router = express.Router();
dotenv.config({ path: path.resolve(__dirname, "../.env" )});

router.get('/', (req, res) => {
    var loggedIn = '';
    if (req.tokenuser.code === 0) {
        loggedIn = `Logged in as ${req.tokenuser.user_id}`;
    } 
    res.send(`
        <h3 style="color:red;">${loggedIn}</h3>
        <p>0. If you cannot see your name above, you have to login and get your token.</br>
        <ul><li>Check if you sent your token with Request header "Authorization : Bearer YOUR TOKEN"</li></ul>
        <p>1. Login with username and Password. (HTTP POST /auth/login)<br>
        <ul><li>Body should contain { "user_id" : "YOUR USER ID", "pwd" : "YOUR PASSWORD" }</li></ul>
        </p>
        <p>2. To create user, you must send administrator's token. (HTTP POST /auth/newuser)</p>
    `)
})

router.get('/loginprompt', (req, res) => {
    res.send(`
        <form action="/auth/login" method="post">
            <div><label for="user_id">API ID</label></div>
            <div><input type="text" name="user_id" placeholder="Your API ID"></div> 

            <div><label for="pwd">API PASSWORD</label></div>
            <div><input type="password" name="pwd" placeholder="Your API Password"></div> 

            <button type="submit">Login</button>
        </form>
    `)
})

router.post('/login', async(req, res) => {
    const user_id = req.body.user_id;
    const pwd = req.body.pwd;

    if (!user_id || !pwd) {
        return util.sendMessage(1, "Missing ID or password. Please check again.", res);
    } 

    const [result] = await db.query('SELECT * FROM user WHERE user_id = ?', [user_id]);

    if (!result[0] || !crypto.timingSafeEqual(crypto.pbkdf2Sync(pwd, result[0].salt, 310000, 32, 'sha256'), result[0].pwd)) {
        return util.sendMessage(2, "Wrong ID or Password. Check again", res);
    }

    const token = await util.generateToken(result[0].id, result[0].user_id);
    util.sendMessage(0, "SUCCESS", res, token);
})

router.post('/newuser', async (req, res) => {
    if (req.tokenuser.code !== 0 || req.tokenuser.access < 10) { //현재 API에 접속한 사용자는 새로운 사용자를 추가 할 권한이 없다.
        return util.sendMessage(3, `No access to user registration. Current user : ${req.tokenuser.user_id}. Contact to administrator`, res);
    }

    const userInfo = req.body;
    const isValid = await validateInfo(userInfo); //새로운 사용자의 정보가 형식에 맞는지 확인한다.
    if (isValid.code !== 0) {
        return res.json(isValid);
    }    

    const salt = crypto.randomBytes(16);
    const hashedPassword = crypto.pbkdf2Sync(userInfo.pwd, salt, 310000, 32, 'sha256')

    await db.query('INSERT INTO user VALUES(?, ?, ?, ?, ?, ?, ?)', [shortid.generate(), userInfo.user_id, hashedPassword, userInfo.email, userInfo.phone, userInfo.access, salt])

    util.sendMessage(0, `${userInfo.user_id} has been added to database.`, res);
})

module.exports = router;
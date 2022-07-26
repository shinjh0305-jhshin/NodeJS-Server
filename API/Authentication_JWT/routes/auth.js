const express = require('express');
const path = require('path');
const shortid = require('shortid');
const dotenv = require('dotenv');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../lib/db');
const validateInfo = require('../lib/user');

const router = express.Router();
dotenv.config({ path: path.resolve(__dirname, "../.env" )});

router.use('*', (req, res, next) => {
    var token = req.get('Authorization');
    
    req.tokenuser = {};

    if (token) {
        token = token.slice(7)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded) {
                req.tokenuser.code = 0;
                req.tokenuser.id = decoded.id;
                req.tokenuser.user_id = decoded.user_id;
            }
        } catch (error) {
            req.tokenuser.code = 2;
            if (error.expiredAt) {
                req.tokenuser.msg = `Your token has been expired.`
            } else {
                req.tokenuser.msg = "Invalid token. Log in again."
            }
            return res.send(req.tokenuser);
        }
    } else {
        req.tokenuser.code = 1;
        req.tokenuser.msg = "No token. Log in."
    }
    next();
})

router.get('/', (req, res) => {
    console.log(req.tokenuser);

    var loggedIn = '';
    if (req.tokenuser.code === 0) {
        loggedIn = `Logged in as ${req.tokenuser.user_id}`;
    } 
    res.send(`
        <h3 style="color:red;">${loggedIn}</h3>
        <p>0. If you cannot see your name above, you have to login and get your token first.</br>
        <p>1. Login with username and Password. (HTTP POST /auth/login)</p>
        <p>2. To create user, you must have to login with admin account. (HTTP POST /auth/newuser)</p>
    `)
})

router.post('/login', async(req, res) => {
    const user_id = req.body.user_id;
    const pwd = req.body.pwd;
    let resultjson = {};

    if (!user_id || !pwd) {
        resultjson.code = 1;
        resultjson.msg = "Missing ID or password. Please check again."
        return res.json(resultjson);
    } 

    const [result] = await db.query('SELECT * FROM user WHERE user_id = ?', [user_id]);

    if (!result[0] || !crypto.timingSafeEqual(crypto.pbkdf2Sync(pwd, result[0].salt, 310000, 32, 'sha256'), result[0].pwd)) {
        resultjson.code = 2;
        resultjson.msg = "Wrong ID or Password. Check again";
        return res.json(resultjson);
    }

    crypto.pbkdf2Sync(pwd, result[0].salt, 310000, 32, 'sha256');
    const token = jwt.sign({
        id: result[0].id,
        user_id: result[0].user_id
    }, process.env.JWT_SECRET, {
        expiresIn: '20m',
        issuer: 'myapi'
    });

    resultjson.code = 0;
    resultjson.msg = "SUCCESS";
    resultjson.token = token;
    res.json(resultjson);
})

router.post('/newuser', async (req, res) => {
    const isValid = await validateInfo(req.body);
    if (isValid.code !== 0) {
        return res.json(isValid);
    }    

    var result = {};

    const [tokenuser] = await db.query('SELECT * FROM user WHERE id=?', [req.tokenuser.id]);
    if (!tokenuser[0] || tokenuser[0].access < 10) { //권한이 
        result.code = 3;
        result.msg = 'No access to user registration. Contact to administrator';
        return res.json(result);
    }
    
    const userInfo = req.body;
    const [data] = await db.query('SELECT * FROM user WHERE user_id=?', [req.body.user_id]);

    if(data[0]) {
        result.code = 2;
        result.msg = 'User already exists';
        return res.json(result);
    }
    if(!data[0]) {
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2Sync(userInfo.pwd, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
            if (err) {
                result.code = 1;
                result.msg = 'something broke on encrypting password';
            } else {
                await db.query('INSERT INTO user VALUES(?, ?, ?, ?, ?, ?, ?)', [shortid.generate(), userInfo.user_id, hashedPassword, userInfo.email, userInfo.phone, userInfo.access, salt])
            }
        })
        result.code = 0;
        result.msg = `${userInfo.user_id} has been added to database.`;
    } else {

    }
    res.json(result);
})
module.exports = router;
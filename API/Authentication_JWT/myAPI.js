const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const board = require('./routes/board');
const auth = require('./routes/auth');
const middleware = require('./middlewares/auth');
const cookieParser = require('cookie-parser');

const app = express();

const corsOptions = {
    "origin": "*",
    "methods": "GET, POST, PUT, DELETE",
    "allowedHeaders": "content-type, x-access-token"
}

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(cors(corsOptions));

app.set('port', 3000);

app.use(cookieParser());
app.use('*', middleware.verifyToken);
app.get('/', (req, res) => {
    if (req.tokenuser.code == 0) {
        var loggedInUser = `<h3 style="color:red;">Welcome, ${req.tokenuser.user_id}.</h3>`;
        var access = req.tokenuser.access;
    } else {
        var loggedInUser = `<h3>Currently, you are not logged in...</h3>`
        var access = "Not Granted."
    }
    res.send (`
        <h1>This is an API(by. JaeHyun Shin)</h1>
        ${loggedInUser}
        <h4>Access : ${access}</h4>
        <form action="/token_process" method="post">
            <input type="text" name="token" placeholder="Your token">
            <input type="submit" value="Login">
        </form>
        <form action="/auth/loginprompt" method"get">
            <input type="submit" value="Get Token">
        </form>
    `)
})
app.post('/token_process', (req, res) => {
    const token = req.body.token;
    res
        .cookie('access_token', 'Bearer ' + token, { httpOnly: true })
        .redirect('/');
})

app.use('/board', board);
app.use('/auth', auth);

app.listen(app.get('port'), () => {
    console.log(`Server running on ${app.get('port')}`);    
})





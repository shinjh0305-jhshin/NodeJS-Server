const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const board = require('./routes/board');
const auth = require('./routes/auth');

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
app.get('/', (req, res) => {
    res.send (`
        <h1>This is an API(by. JaeHyun Shin)</h1>
    `)
})

app.use('/board', board);
app.use('/auth', auth);

app.listen(app.get('port'), () => {
    console.log(`Server running on ${app.get('port')}`);    
})





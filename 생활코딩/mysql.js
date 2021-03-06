const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, "../.env" )});

const connection = mysql.createConnection({
    host : process.env.HOST,
    user : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
});

connection.connect();

connection.query('SELECT * FROM TOPIC', function(err, res, field) {
    if (err) {
        console.error(err);
    }
    console.log(res);
});
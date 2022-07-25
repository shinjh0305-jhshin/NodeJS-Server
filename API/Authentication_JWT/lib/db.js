const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config({ path: path.resolve(__dirname, "../../.env" )});

const db = mysql.createPool({
    host : process.env.HOST,
    user : process.env.DBUSER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
}).promise();

module.exports = db;
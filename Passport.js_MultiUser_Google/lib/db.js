const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, "../../.env" )});

const db = mysql.createPool({
    host : process.env.HOST,
    user : process.env.DBUSER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
}).promise();

module.exports = db;
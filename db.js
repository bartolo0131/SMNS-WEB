require('dotenv').config();
const mysql = require('mysql');
const path = require('path');
const session = require("express-session");


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});



connection.connect(error => {
    if (error) {
        console.error('Error conectando a MySQL:' + error);
        return;
    }
    console.log('Conectado a MySQL por fin');
});

module.exports = connection;




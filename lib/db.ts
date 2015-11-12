import mysql = require('mysql');
var conf = require("../config").database;

export = callback => {
    mysql.createPool(conf).getConnection((err, cn) => {
        callback(cn);
    });
};
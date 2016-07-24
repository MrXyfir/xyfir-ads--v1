const mysql = require("mysql");

// Set global["__mysql"] equal to a client pool
if (global["__mysql"] === undefined) {
    const config = require("../config").database;
    global["__mysql"] = mysql.createPool(config);
}

module.exports = function(fn) {
    
    global["__mysql"].getConnection((err, cn) => fn(cn));

};
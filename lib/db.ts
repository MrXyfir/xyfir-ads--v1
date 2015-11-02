export = (callback) => {
    require('mysql').createPool(require('../config').database).getConnection((err, connection) => {
        callback(connection);
    });
};
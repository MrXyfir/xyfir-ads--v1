module.exports = function (callback) {
    require('mysql').createPool(require('../config').database).getConnection(function (err, connection) {
        callback(connection);
    });
};
//# sourceMappingURL=db.js.map
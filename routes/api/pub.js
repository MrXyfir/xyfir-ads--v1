var router = require('express').Router();
var pub = require('../../controllers/api/pub');
router.get('/sites', pub.sites);
module.exports = router;
//# sourceMappingURL=pub.js.map
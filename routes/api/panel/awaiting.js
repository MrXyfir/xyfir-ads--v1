var router = require('express').Router();
var awaiting = require('../../../controllers/api/panel/awaiting');
router.get('/', awaiting.getAll);
router.post('/:id/deny', awaiting.deny);
router.post('/:id/approve', awaiting.approve);
module.exports = router;
//# sourceMappingURL=awaiting.js.map
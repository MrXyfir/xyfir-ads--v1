var router = require('express').Router();
var awaiting = require('../../../controllers/api/panel/awaiting');

router.get('/', awaiting.getAll);
router.post('/deny', awaiting.deny);
router.post('/approve', awaiting.approve);

export = router;
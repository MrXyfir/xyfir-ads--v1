var router = require('express').Router();
var account = require('../../../controllers/api/publishers/account');

router.route('/')
    .get(account.info)
    .put(account.update);
router.post('/register', account.register);

export = router;
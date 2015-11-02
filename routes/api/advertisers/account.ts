var router = require('express').Router();
var account = require('../../../controllers/api/advertisers/account');

router.route('/')
    .get(account.info)
    .put(account.update);
router.post('/funds', account.addFunds);
router.post('/register', account.register);

export = router;
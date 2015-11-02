var router = require('express').Router();

router.get('/account', require('./account'));
router.get('/campaigns', require('./campaigns'));

export = router;
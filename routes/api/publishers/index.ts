var router = require('express').Router();

router.use('/account', require('./account'));
router.use('/campaigns', require('./campaigns'));

export = router;
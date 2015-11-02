var router = require('express').Router();

router.use('/awaiting', require('./awaiting'));

export = router;
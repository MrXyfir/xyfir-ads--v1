var router = require('express').Router();

router.use('/awaiting/*', require('../../controllers/panel/awaiting'));

export = router;
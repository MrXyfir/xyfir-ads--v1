var router = require('express').Router();

router.use('/*', require('../../controllers/panel/awaiting'));

export = router;
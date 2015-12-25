var router = require('express').Router();

router.get('/', require('../../controllers/api/login'));

export = router;
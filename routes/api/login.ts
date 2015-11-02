var router = require('express').Router();

router.post('/', require('../../controllers/api/login'));

export = router;
var router = require('express').Router();

router.get('/', require('../controllers/click'));

export = router;
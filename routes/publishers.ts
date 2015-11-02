var router = require('express').Router();

router.get('/*', require('../controllers/publishers'));

export = router;
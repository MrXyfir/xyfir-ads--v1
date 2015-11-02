var router = require('express').Router();

router.get('/', require('../../controllers/api/ads'));

export = router;
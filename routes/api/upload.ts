var router = require('express').Router();

router.post('/', require('../../controllers/api/upload'));

export = router;
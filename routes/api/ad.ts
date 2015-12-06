var router = require('express').Router();
var ad = require('../../controllers/api/ad');

router.get('/pricing', ad.pricing);
router.get('/info', ad.info);

export = router;
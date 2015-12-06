var router = require('express').Router();
var pub = require('../../controllers/api/pub');

router.get('/categories', pub.categories);
router.get('/sites', pub.sites);
router.get('/info', pub.info);

export = router;
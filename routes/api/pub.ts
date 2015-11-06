var router = require('express').Router();
var pub = require('../../controllers/api/pub');

router.get('/sites', pub.sites);

export = router;
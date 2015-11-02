var router = require('express').Router();

router.get('/*', require('../controllers/advertisers'));

export = router;
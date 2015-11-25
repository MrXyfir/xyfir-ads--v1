import publishers = require('../../../controllers/api/panel/awaitingPublishers');
import ads = require("../../../controllers/api/panel/awaitingAds");

var router = require('express').Router();

router.get('/ads', ads.awaiting);
router.post('/ads/:id', ads.approve);
router.delete('/ads/:id', ads.deny);

router.get('/publishers', publishers.awaiting);
router.post('/publishers/:id', publishers.approve);
router.delete('/publishers/:id', publishers.deny);

export = router;
var router = require('express').Router();
router.use('/ad', require('./ad'));
router.use('/pub', require('./pub'));
router.use('/ads', require('./ads'));
router.use('/login', require('./login'));
router.use('/panel', require('./panel/'));
//router.use('/upload', require('./upload'));
router.use('/publishers', require('./publishers/'));
router.use('/advertisers', require('./advertisers/'));
module.exports = router;
//# sourceMappingURL=index.js.map
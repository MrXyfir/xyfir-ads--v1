var router = require('express').Router();
var xad = require('../../controllers/api/xad-id');

router.route('/:xacc/:xad')
    .get(xad.info)
    .put(xad.update);
router.post('/:xacc', xad.create);

export = router;
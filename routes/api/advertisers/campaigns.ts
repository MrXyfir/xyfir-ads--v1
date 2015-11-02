var router = require('express').Router();
var campaign = require('../../../controllers/api/advertisers/campaign');
var campaigns = require('../../../controllers/api/advertisers/campaigns');

router.route('/')
    .get(campaigns.getAll)
    .post(campaigns.create);
router.route('/:id')
    .get(campaign.getSingle)
    .put(campaign.update)
    .delete(campaign.remove);
router.put('/:id/funds', campaign.funds);
router.put('/:id/bidding', campaign.bidding);

export = router;
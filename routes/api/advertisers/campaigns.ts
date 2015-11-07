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
router.put('/:id/budget', campaign.budget);
router.put('/:id/bidding', campaign.bidding);
router.get('/:id/reports', campaign.reports);

export = router;
const router = require("express").Router();

/* Account */
router.get("/account/login", require("./account/login"));
router.get("/account/status", require("./account/status"));

/* Ads */
router.get("/ads", require("./ads/get"));
router.get("/click", require("./ads/click"));
router.get("/ad/info", require("./ads/info"));
router.get("/ad/pricing", require("./ads/pricing"));

/* Advertisers - Account */
router.get("/advertisers/account", require("./advertisers/account/info"));
router.put("/advertisers/account", require("./advertisers/account/update"));
router.post("/advertisers/account/funds", require("./advertisers/account/add-funds"));
router.post("/advertisers/account/register", require("./advertisers/account/register"));

/* Advertisers - Campaigns */
router.post("/advertisers/campaigns", require("./advertisers/campaigns/create"));
router.get("/advertisers/campaigns", require("./advertisers/campaigns/get-all"));
router.put("/advertisers/campaigns/:id", require("./advertisers/campaigns/update"));
router.put("/advertisers/campaigns/:id/bid", require("./advertisers/campaigns/bid"));
router.delete("/advertisers/campaigns/:id", require("./advertisers/campaigns/remove"));
router.get("/advertisers/campaigns/:id", require("./advertisers/campaigns/get-single"));
router.put("/advertisers/campaigns/:id/funds", require("./advertisers/campaigns/funds"));
router.put("/advertisers/campaigns/:id/budget", require("./advertisers/campaigns/budget"));
router.get("/advertisers/campaigns/:id/reports", require("./advertisers/campaigns/reports"));

/* Panel - Awaiting - Ads */
router.get("/panel/awaiting/ads", require("./panel/awaiting/ads/get"));
router.get("/panel/awaiting/ads/:id", require("./panel/awaiting/ads/info"));
router.delete("/panel/awaiting/ads/:id", require("./panel/awaiting/ads/deny"));
router.post("/panel/awaiting/ads/:id", require("./panel/awaiting/ads/approve"));

/* Panel - Awaiting - Publishers */
router.get("/panel/awaiting/publishers", require("./panel/awaiting/publishers/get"));
router.get("/panel/awaiting/publishers/:id", require("./panel/awaiting/publishers/info"));
router.delete("/panel/awaiting/publishers/:id", require("./panel/awaiting/publishers/deny"));
router.post("/panel/awaiting/publishers/:id", require("./panel/awaiting/publishers/approve"));

/* Pub */
router.get("/pub/info", require("./pub/info"));
router.get("/pub/sites", require("./pub/sites"));
router.get("/pub/categories", require("./pub/categories"));

/* Publishers - Account */
router.get("/publishers/account", require("./publishers/account/info"));
router.put("/publishers/account", require("./publishers/account/update"));
router.post("/publishers/account/register", require("./publishers/account/register"));

/* Publishers - Campaigns */
router.post("/publishers/campaigns", require("./publishers/campaigns/create"));
router.get("/publishers/campaigns", require("./publishers/campaigns/get-all"));
router.put("/publishers/campaigns/:id", require("./publishers/campaigns/update"));
router.delete("/publishers/campaigns/:id", require("./publishers/campaigns/remove"));
router.get("/publishers/campaigns/:id", require("./publishers/campaigns/get-single"));
router.get("/publishers/campaigns/:id", require("./publishers/campaigns/get-single"));
router.get("/publishers/campaigns/:id/reports", require("./publishers/campaigns/reports"));
router.put("/publishers/campaigns/:id/test", require("./publishers/campaigns/generate-test-key"));

/* Publishers - Campaign - Ad Blacklist */
router.get("/publishers/campaigns/:id/blacklist", require("./publishers/campaigns/blacklist/get"));
router.post("/publishers/campaigns/:id/blacklist/:ad", require("./publishers/campaigns/blacklist/add-to"));
router.delete("/publishers/campaigns/:id/blacklist/:ad", require("./publishers/campaigns/blacklist/remove-from"));

/* Misc */
router.post("/upload", require("./upload"));

/* Xyfir Ads ID */
router.post("/xad-id/:xacc", require("./xad-id/create"));
router.get("/xad-id/:xacc/:xad", require("./xad-id/info"));
router.put("/xad-id/:xacc/:xad", require("./xad-id/update"));

module.exports = router;
module.exports = {
    pricing: function (req, res) {
        require("../../lib/ad/price")(req.query.adType, req.query.payType, req.query.category, function (info) {
            res.json(info);
        });
    }
};
//# sourceMappingURL=ad.js.map
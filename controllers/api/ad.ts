export = {
    
    pricing: (req, res) => {
        require("../../lib/ad/price")
        (req.query.adType, req.query.payType, req.query.category, info => {
            res.json(info);
        });
    }

};
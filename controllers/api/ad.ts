export = {

    /*
        GET api/ad/pricing
        REQUIRED
            adType: number, payType: number, category: string
        RETURN
            { base: number, competitors: number, average: number, highest: number }
        DESCRIPTION
            Returns info object from lib/ad/price module
    */
    pricing: (req, res) => {
        require("../../lib/ad/price")
        (req.query.adType, req.query.payType, req.query.category, info => {
            res.json(info);
        });
    }

};
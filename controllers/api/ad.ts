import db = require("../../lib/db");

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
    },

    /*
        GET api/ad/info
        REQUIRED
            id: number
        DESCRIPTION
            Return public info regarding ad campaign
        RETURN
            { title: string }
    */
    info: (req, res) => {
        var sql: string = "SELECT ad_titile FROM ads WHERE id = ?";

        db(cn => cn.query(sql, [req.query.id], (err, rows) => {
            cn.release();

            if (err || !rows.length)
                res.json({ title: "Unknown" });
            else
                res.json({ title: rows[0].site });
        }));
    }
};
import db = require("../../lib/db");

interface IAd {
    type: number, link: string, title: string,
    description: string, media?: string,
    score?: number
}

interface IPub {
    type: number, categories: string, keywords: string, site: string
}

interface IRequestQuery {
    pubid: number, xadid?: string, type?: number, types?: string,
    count?: number, speed?: number, ip?: string, age?: number,
    gender?: number, categories?: string, keywords?: string
}

/*
    GET api/ads
    REQUIRED
        pubid: number
    OPTIONAL
        xadid: string, type: number, types: string, count: number,
        speed: number, ip: string, age: number, gender: number,
        categories: string, keywords: string
    RETURN
        {ads: [
            {
                type: number, link: string, title: string,
                description: string, media?: string
            }, ...
        ]}
    DESCRIPTION
        Attempts to find and return relevant ads
*/
export = (req, res) => {
    
    // pubid is required
    if (!req.query.pubid) {
        res.json({ ads: [] });
        return;
    }
    // Setup variables
    else {
        var q: IRequestQuery = req.query, ads: IAd[] = [],
            sql: string, cn: any, pub: IPub, user: any;
        req.query = null;

        q.speed = !q.speed ? 0 : q.speed;

        db(connection => {
            cn = connection;
            initialize();
        });
    }

    /* Get/Prepare Info Needed Later */
    var initialize = (): void => {
        // Grab pub campaign's information
        sql = "SELECT categories, keywords, site, type FROM pubs WHERE id = ?";
        cn.query(sql, [req.query.pubid], (err, rows) => {
            if (err || !rows.length) {
                cn.release();
                res.json({ ads: [] });
                return;
            }

            pub = rows[0];

            if (req.query.xadid && (!req.query.age || !req.query.gender)) {
                sql = "SELECT info FROM xad_ids WHERE xad_id = ?";
                cn.query(sql, [req.query.xadid], (err, rows) => {
                    if (!err && !!rows.length)
                        user = JSON.parse(rows[0].info);
                    buildQuery();
                });
            }
            else {
                buildQuery();
            }
        });
    };

    /* Build Initial SQL Query */
    var buildQuery = (): void => {
        
    };

    /* Filter Out Irrelevant Ads */
    var filterAds = (): void => {

    };

    /* Find Ads to Return from Filtered */
    var returnAds = (): void => {

    };

    /* Update Ad/Pub Campaigns/Reports */
    var updateValues = (): void => {

    };

};
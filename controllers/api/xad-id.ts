import secret = require("../../config").secrets.xadid;
import db = require("../../lib/db");

export = {

    /*
        POST api/xad-id/:xacc
        REQUIRED
            secret: string
        RETURN
            { error: boolean }
        DESCRIPTION
            Generates an xad-id for the Xyfir Account :xacc
    */
    create: (req, res) => {
        var sql: string;

        if (secret != req.body.secret) {
            res.json({ error: true });
            return;
        }

        db(cn => {
            // Check if account already has an xad-id
            sql = "SELECT xad_id FROM xad_ids WHERE xacc_uid = ?";
            cn.query(sql, [req.params.xacc], (err, rows) => {

                if (err || !rows.length) {
                    cn.release();
                    res.json({ error: true });
                    return;
                }

                var insert = {
                    xad_id: "", xacc_uid: req.params.xacc
                };

                // Generate xad-id and attempt to save to database
                // Recursively loops until an unused id is found
                var generate = (): void => {
                    // Generate xad-id
                    insert.xad_id = require('crypto').createHash('sha1').update(
                        Math.floor(Math.random() * (999999999 - 99999999 + 1) + 99999999
                        ).toString()).digest('hex').substr(20);

                    // Check if id already exists
                    sql = "SELECT * FROM xad_ids WHERE xad_id = ?";
                    cn.query(sql, [insert.xad_id], (err, rows) => {
                        if (err) {
                            cn.release();
                            res.json({ error: true });
                            return;
                        }
                        else if (!!rows.length) {
                            generate();
                        }
                        else {
                            // Insert xad_id / xacc_uid into database
                            sql = "INSERT INTO xad_ids SET ?";
                            cn.query(sql, insert, (err, result) => {
                                cn.release();

                                res.json({ error: !!err });
                            });
                        }
                    });
                };

                generate();
            });
        });
    },

    /*
        GET api/xad-id/:xacc/:xad
        REQUIRED
            secret: string
        RETURN
            { info: json-string }
        DESCRIPTION
            Returns stringified info JSON object where xacc and xad
    */
    info: (req, res) => {
        var sql: string;

        if (secret != req.query.secret) {
            res.json({ error: true });
            return;
        }

        sql = "SELECT info FROM xad_ids WHERE xad_id = ? AND xacc_uid = ?";
        db(cn => cn.query(sql, [req.params.xad, req.params.xacc], (err, rows) => {
            cn.release();

            if (err || !rows.length) res.json({ info: "" });
            else res.json({ info: rows[0].info });
        }));
    },

    /*
        PUT api/xad-id/:xacc/:xad
        REQUIRED
            secret: string, info: json-string
        RETURN
            { error: boolean }
        DESCRIPTION
            Updates info object-string where xacc and xad
            *All validation is done by Xyfir Accounts
    */
    update: (req, res) => {
        var sql: string;

        if (secret != req.body.secret || !req.body.info) {
            res.json({ error: true });
            return;
        }

        sql = "UPDATE xad_ids SET info = ? WHERE xad_id = ? AND xacc_uid = ?";
        db(cn => cn.query(sql, [req.body.info, req.params.xad, req.params.xacc], (err, result) => {
            cn.release();
            res.json({ error: !!err });
        }));
    }

};
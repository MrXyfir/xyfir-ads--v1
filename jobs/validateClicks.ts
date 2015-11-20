/// <reference path="../typings/jobs/validateClicks.d.ts" />

import db = require("../lib/db");

/*
    Validates clicks in the clicks table
    Modifies costs/earnings for campaigns
    All clicks in table are from CPC ads
*/
export = (fn: any): void => db(cn => {

    var sql: string;

    var campaigns = {
        publish: [
            { id: 0, amount: 0 }
        ],
        advert: [
            { id: 0, amount: 0 }
        ]
    };

    // Loop through each row from past day
    sql = "SELECT * FROM clicks WHERE CURDATE() > clicked";
    cn.query(sql)
        .on("result", validate)
        .on("error", () => {
            cn.end();
            cn.release();
            fn(true);
        })
        .on("end", update);

    // Validate clicks for IP with publisher
    var validate = (click: IClick): void => {
        cn.pause();

        //  Grab all clicks where pub/ip match current row's
        sql = "SELECT * FROM clicks WHERE CURDATE() > clicked AND pub_id = ? AND ip = ?";
        cn.query(sql, [click.pub_id, click.ip], (err, rows: IClick[]) => {

            // There are no other clicks on pub with ip
            if (rows.length == 1) {
                if (rows[0].clicked - rows[0].served > 5)
                    updateFunds(click.pub_id, click.cost, "publish");
                else
                    updateFunds(click.ad_id, click.cost, "advert");

                deleteClicks(click.pub_id, click.ip, () => cn.resume());
                return;
            }

            // Invalidate clicks that happened too fast
            // Set a value for if click was made by same user from click row
            for (var i: number = 0; i < rows.length; i++) {
                // Ensure individual click is valid
                if (rows[i].clicked - rows[i].served > 5) {
                    rows[i].valid = true;

                    // Validate by browser signature
                    if (!rows[i].xad_id) {
                        // Click was made by same user as in click row
                        if (click.signature == rows[i].signature)
                            rows[i].user = 1;
                        else
                            rows[i].user = 0;
                    }
                    // Validate by xad_id
                    else {
                        // Click was made by same user as in click row
                        if (click.xad_id == rows[i].xad_id)
                            rows[i].user = 1;
                        else
                            rows[i].user = 0;
                    }
                }
                else {
                    rows[i].valid = false;
                }
            }

            // Invalidate clicks in each group of clicks from same user
            for (var u: number = 0; u < 2; u++) {
                var clicks: number = 0;

                for (var i: number = 0; i < rows.length; i++) {
                    if (rows[i].user == u) {
                        // Invalidate all clicks from user if more than 3 ads where clicked
                        if (++clicks > 3) {
                            for (var j: number = 0; j < rows.length; j++) {
                                if (rows[j].user = u) rows[j].valid = false;
                            }
                        }

                        // Invalidate clicks from same user within 30 seconds of another
                        for (var j: number = 0; j < rows.length; j++) {
                            if (i == j || rows[i].user != rows[j].user) continue;

                            // j is within +- 30 seconds of i's clicked
                            if (rows[i].clicked - 30 <= rows[j].clicked && rows[j].clicked <= rows[i].clicked + 30)
                                rows[j].valid = false;
                        }
                    }
                }
            }

            // Loop through clicks: if valid: updateFunds for publisher, else: advertiser
            for (var i: number = 0; i < rows.length; i++) {
                if (rows[i].valid)
                    updateFunds(click.pub_id, rows[i].cost, "publish");
                else
                    updateFunds(rows[i].ad_id, rows[i].cost, "advert");
            }
            
            // Delete all rows where ip and pub id
            deleteClicks(click.pub_id, click.ip, () => cn.resume());

        });

        // Adds cost to id in campaigns.* array
        var updateFunds = (id: number, cost: number, type: string): void => {
            var i = campaignIndex();

            if (i == 0) // Add campaign to array
                campaigns[type].push({ id: id, amount: cost });
            else // Add to amount for campaign
                campaigns[type][i].amount += cost;

            // Find index for campaign in campaigns.*[]
            var campaignIndex = (): number => {
                for (var i: number = 0; i < campaigns[type]; i++) {
                    if (campaigns[type][i].id == id) return i;
                }

                return 0;
            };
        };

        // Deletes clicks where id, ip, and clicked was yesterday
        var deleteClicks = (id: number, ip: string, fn: any): void => {
            sql = "DELETE FROM clicks WHERE pub_id = ? AND ip = ? AND CURDATE() > clicked";
            cn.query(sql, [id, ip], (err, result) => fn());
        };
    };

    // Credit / deduct funds from each campaign
    var update = (): void => {
        // Update pub campaign at array index i
        var pub = (i: number): void => {
            if (campaigns.publish[i] == undefined) {
                cn.release();
                return;
            }

            sql = "UPDATE pub_reports SET earnings = earnings + ?, earnings_temp = 0 "
                + "WHERE id = ? AND day = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
            cn.query(sql, [campaigns.publish[i].amount, campaigns.publish[i].id], (err, result) => {
                pub(!!err ? i : i++); // repeat if error
            });
        };

        // Update ad campaign at array index i
        var ad = (i: number): void => {
            if (campaigns.advert[i] == undefined) {
                pub(1);
                return;
            }

            sql = "UPDATE ad_reports SET cost = cost - ? WHERE id = ? AND day = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
            cn.query(sql, [campaigns.advert[i].amount, campaigns.advert[i].id], (err, result) => {
                if (err) {
                    ad(i);
                }
                else {
                    sql = "UPDATE ads SET funds = funds + ? WHERE id = ?";
                    cn.query(sql, [campaigns.advert[i].amount, campaigns.advert[i].id], (err, result) => ad(i++));
                }
            });
        };

        // Start updating ads
        // Calls pub() after all ads are updated
        ad(1);
    };

});
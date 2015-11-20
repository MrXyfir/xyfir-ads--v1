/// <reference path="../typings/jobs/validateClicks.d.ts" />

import db = require("../lib/db");

/*
    Validates clicks in the clicks table
    Modifies costs/earnings for campaigns
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

            // Only one click and it's valid
            if (rows.length == 1 && rows[0].clicked - rows[0].served > 5) {
                updateFunds(click.pub_id, click.cost, "publish");
                deleteClicks(click.pub_id, click.ip, () => cn.resume());
                return;
            }

            // ** Modify rows to only contain valid clicks (clicked - server > 5)
            // ** Modify rows to mark which user the click came from
            // ** Invalidate all clicks from same user within 30 seconds of another
            // ** Invalidate all clicks from user if more than 3 ads where clicked
            // ** Update funds for appropriate campagin, delete all clicks for ip/pub

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
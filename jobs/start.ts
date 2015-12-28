/// <reference path="../typings/cron/cron.d.ts" />

import cron = require("cron");

/*
    Sets cronjobs to run at appropriate times
    Handles errors / responses from jobs
*/
export = (): void => {
    var jobs = {
        autobid: require("./autobid"),
        deleteReports: require("./deleteReports"),
        createReports: require("./createReports"),
        validateClicks: require("./validateClicks"),
        dailyAllocatedFunds: require("./dailyAllocatedFunds"),
        updateGeoIpDatabase: require("./updateGeoIpDatabase")
    };

    // Generate ad cost for ads where autobid
    // Runs at every third hour
    // Retries once on failure
    new cron.CronJob("0 */3 * * *", () => {

        jobs.autobid(err => {
            if (err) jobs.autobid(err => { return; });
        });

    }, () => { return; }, true);

    // Create ad and pub campaign reports
    // Runs at 23:30 every day
    // Retries indefinitely on error
    new cron.CronJob("30 23 * * *", () => {

        var run = (): void => jobs.createReports(err => {
            if (err) run();
        });

        run();

    }, () => { return; }, true);

    // Delete ad/pub reports older than 3 months
    // Runs once at 01:00 every day
    new cron.CronJob("0 1 * * *", () => {

        jobs.autobid(() => { return; });

    }, () => { return; }, true);

    // Subtracts used funds and resets daily_funds_used
        // where daily_funds > 0
    // Runs at the beginning of each day
    // Retries indefinitely on error
    new cron.CronJob("0 0 * * *", () => {

        var run = (): void => jobs.dailyAllocatedFunds(err => {
            if (err) run();
        });

        run();

    }, () => { return; }, true);

    // Validates clicks and earnings/costs for previous day
    // Runs 2 minutes into the start of each day
    // Retries indefinitely on error
    new cron.CronJob("2 0 * * *", () => {

        var run = (): void => jobs.validateClicks(err => {
            if (err) run();
        });

        run();

    }, () => { return; }, true);

    // Updates MaxMind's GeoIP (lite) database
    // Runs at 06:00 twice a month
    // No error checking
    new cron.CronJob("0 6 */16 * *", () => {
        jobs.updateGeoIpDatabase();
    }, () => { return; }, true);

};
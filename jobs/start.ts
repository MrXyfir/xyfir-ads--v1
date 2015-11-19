/// <reference path="../typings/cron/cron.d.ts" />

import cron = require("cron");

/*
    Sets cronjobs to run at appropriate times
    Handles errors / responses from jobs
*/
export = (): void => {

    var jobs = {
        autobid: require("autobid"),
        deleteReports: require("deleteReports"),
        createReports: require("createReports"),
        dailyAllocatedFunds: require("dailyAllocatedFunds")
    };

    // Generate ad cost for ads where autobid
    // Runs once every three hours
    // Retries once on failure
    new cron.CronJob("", () => {

        jobs.autobid(err => {
            if (err) jobs.autobid(err => { return; });
        });

    }, () => { return; }, true);

    // Create ad and pub campaign reports
    // Runs at the beginning of each day
    // Retries indefinitely on error
    new cron.CronJob("", () => {

        var run = (): void => jobs.createReports(res => {
            // Database error
            if (res == 1)
                run();
            // Ran too early
            if (res == 2)
                setTimeout(() => { run(); }, 2500);
        });

        run();

    }, () => { return; }, true);

    // Delete ad/pub reports older than 3 months
    // Runs once during the middle of day
    new cron.CronJob("", () => {

        jobs.autobid(() => { return; });

    }, () => { return; }, true);

    // Subtracts used funds and resets daily_funds_used
        // where daily_funds > 0
    // Runs at the beginning of each day
    // Retries indefinitely on error
    new cron.CronJob("", () => {

        var run = (): void => jobs.dailyAllocatedFunds(err => {
            if (err) run();
        });

        run();

    }, () => { return; }, true);

};
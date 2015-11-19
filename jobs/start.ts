/// <reference path="../typings/cron/cron.d.ts" />

import cron = require("cron");

/*
    Sets cronjobs to run at appropriate times
    Handles errors / responses from jobs
*/
export = (): void => {
    // ** Modify module to loop through jobs array of objects starting and managing jobs
	// ** Job object contains function, cron string, retry amount, retry delay
    var jobs = {
        autobid: require("autobid"),
        deleteReports: require("deleteReports"),
        createReports: require("createReports"),
        validateClicks: require("validateClicks"),
        dailyAllocatedFunds: require("dailyAllocatedFunds")
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
    // Runs at 00:30 every day
    // Retries indefinitely on error
    new cron.CronJob("30 0 * * *", () => {

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

};
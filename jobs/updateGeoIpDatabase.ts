import { exec } from "child_process";

export = () => {
    // Move into geoip-lite's directory
    // Run npm script to update the database
    var cmd = "cd node_modules/geoip-lite & npm run-script updatedb";

    exec(cmd, (error, stdout, stderr) => {
        console.log('running/ended');
        console.log(error);
        console.log(stdout);
        console.log(stderr);
    });
};
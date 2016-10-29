const exec = require("child_process").exec;

module.exports = () => {
    // Move into geoip-lite's directory
    // Run npm script to update the database
    const cmd = "cd node_modules/geoip-lite; npm run-script updatedb";

    exec(cmd, (error, stdout, stderr) => {
        console.log("Update geoip db");
        console.log("Error", error);
        console.log("Output", stdout);
        console.log("Error Ouput", stderr);
    });
};
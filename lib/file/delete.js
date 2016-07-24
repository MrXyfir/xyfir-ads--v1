const cloudinary = require("cloudinary");
const config = require("config").cloudinary;

// Deletes a file by id from Cloudinary
module.exports = function(ids) {

    cloudinary.config(config);

    cloudinary.api.delete_resources(ids, res => { return; });

};
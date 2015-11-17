var cloudinary = require("cloudinary");
var config = require("../../config").cloudinary;

// Deletes a file by id from Cloudinary
export = (ids: string[]): void => {

    cloudinary.config(config);

    cloudinary.api.delete_resources(ids, res => { return; });

};
var cloudinary = require("cloudinary");
var config = require("../../config").cloudinary;

// Deletes a file by id from Cloudinary
export = (id: string): void => {

    cloudinary.config(config);

    cloudinary.api.delete_resources([id], res => { return; });

};
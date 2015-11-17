/*
    POST api/upoad
    REQUIRED
        type: number, size: number
    OPTIONAL
        files.file: data, url: string
    RETURN
        { error: bool, message: string, link?: string }
    DESCRIPTION
        Upload images or videos for ads using Cloudinary
*/
export = (req, res) => {

    // Check if user can upload files
    if (!req.files.file && !req.body.url) {
        res.json({ error: true, message: "No content to upload provided" });
        return;
    }
    if (!req.session.uid || !req.session.advertiser) {
        res.json({ error: true, message: "You  must be logged in to upload files" });
        return;
    }

    // Setup Cloudinary
    var cloudinary = require("cloudinary");
    var config = require("../../config").cloudinary;
    cloudinary.config(config);

    // Upload file to Cloudinary
    var file = req.body.url || req.files.file.path;
    cloudinary.uploader.upload(file, result => {

        // Validate file and upload
        var isValid = (): string => {
            var dimensions = require("../../lib/file/dimensions");

            if (!result.secure_url)
                return "An unkown error occured";
            else if (result.bytes > 104857600)
                return "File size limit exceeded (100mb)";
            
            // Validate image
            if (req.body.type == 1) {
                // Type
                if (result.resource_type != "image")
                    return "Invalid file format"

                // Size
                for (var i: number = 0; i < dimensions.image.length; i++) {
                    if (dimensions.image[i].size == req.body.size) {
                        if (dimensions.image[i].height != result.height)
                            return "Invalid file dimensions";
                        break;
                    }
                }
            }
            
            // Validate video
            else if (req.body.type == 2) {
                // Type
                if (result.resource_type != "video")
                    return "Invalid file format"

                // Size
                for (var i: number = 0; i < dimensions.video.length; i++) {
                    if (dimensions.video[i].size == req.body.size) {
                        if (dimensions.video[i].height != result.height)
                            return "Invalid file dimensions";
                        break;
                    }
                }
            }

            return "";
        };

        var error = isValid();

        // Send response to client
        if (!!error) {
            res.json({ error: true, message: error });
            deleteFile(file, result.public_id);
        }
        else {
            res.json({ error: false, message: "File uploaded successfully", link: result.secure_url });
            deleteFile(file);
        }
    });

    // Delete file from server and cloud if available
    var deleteFile = (path: string, cloud: string = ''): void => {
        // Path is an actual path, not url
        if (path.substr(0, 1) == '/') require("fs").unlink(path, err => { return; });

        // Delete file from Cloudinary
        if (!!cloud) require("../../lib/file/delete")(cloud);
    };
};
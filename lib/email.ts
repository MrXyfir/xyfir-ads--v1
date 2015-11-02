/// <reference path="../typings/nodemailer/nodemailer.d.ts" />

var config = require('../../config').nodemailer;

export = (email: string, subject: string, message: string) => {

    require('nodemailer').createTransport({
        service: config.service,
        auth: config.auth
    }).sendMail({
        from: config.from,
        to: email,
        subject: "Xyfir Ads - " + subject,
        html: message
    },
    function (err, info) {
        return;
    });

}
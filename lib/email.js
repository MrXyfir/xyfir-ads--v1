const config = require("config");

const mailcomposer = require("mailcomposer");
const mailgun = require("mailgun-js")({
	apiKey: config.keys.mailgun,
	domain: config.addresses.mailgun.domain
});

module.exports = function(to, subject, html) {

	mailcomposer({
		from: "Xyfir Ads <ads@xyfir.com>", to, subject, html
	})
	.build((err, message) => {
		mailgun.messages().sendMime({
			to, message: message.toString("ascii")
		}, (err, body) => {
			return;
		});
	});

}
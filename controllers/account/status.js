/*
	GET api/account/status
	RETURN
		{
			loggedIn: bool, admin?: boolean,
			advertiser?: boolean, publisher?: boolean
		}
*/
module.exports = function(req, res) {
	
	if (req.session.uid) {
		res.json({
			admin: req.session.uid <= 100,
			loggedIn: true,
			advertiser: req.session.advertiser,
			publisher: req.session.publisher
		});
	}
	else {
		res.json({ loggedIn: false });
	}

}
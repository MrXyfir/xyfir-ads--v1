/*
	GET api/account/status
	RETURN
		{ loggedIn: bool }
*/
module.exports = function(req, res) {
	
	res.json({ loggedIn: !!req.session.uid });

}
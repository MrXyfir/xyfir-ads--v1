export = (req, res) => {
    req.session.uid = 1; req.session.advertiser = true; req.session.publisher = true; // ** Remove on production
    res.render('layout', {title: 'Xyfir Ads', react: 'Home'});
};
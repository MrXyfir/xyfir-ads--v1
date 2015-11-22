export = (req, res) => {
    if (!req.session.uid || !req.session.advertiser)
        res.redirect('..');
    else
        res.render('layout', { title: 'Xyfir Ads - Advertisers', react: 'Advertisers' });
};
export = (req, res) => {
    if (!req.session.uid || !req.session.advertisers)
        res.redirect('..');
    else
        res.render('layout', { title: 'Xyfir Ads - Advertisers', react: 'Advertisers' });
};
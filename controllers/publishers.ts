export = (req, res) => {
    if (!req.session.uid || !req.session.publisher)
        res.redirect('..');
    else
        res.render('layout', { title: 'Xyfir Ads - Publishers', react: 'Publishers' });
};
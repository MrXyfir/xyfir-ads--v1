export = (req, res) => {
    req.session.uid = 1; // ** Remove on production
    res.render('layout', {title: 'Xyfir Ads', react: 'Home'});
};
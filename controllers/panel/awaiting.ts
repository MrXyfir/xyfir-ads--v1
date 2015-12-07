export = (req, res) => {
    // All non-staff accounts have user ids of 1000+
    if (!req.session.uid || req.session.uid > 999)
        res.redirect('../..');
    else
        res.render('layout', { title: 'Xyfir Ads - Panel - Awaiting', react: 'PanelAwaiting' });
};
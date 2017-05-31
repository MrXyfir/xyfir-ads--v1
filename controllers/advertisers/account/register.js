const mysql = require('lib/mysql');

/*
  POST api/advertisers/account/register
  RETURN
    { error: bool, message: string }
*/
module.exports = async function(req, res) {
  
  const db = new mysql;

  try {
    if (!req.session.uid)
      throw 'You must login first with your Xyfir Account';
    else if (req.session.advertiser)
      throw 'You are already an advertiser';
    
    await db.getConnection();

    let sql = `
      INSERT INTO advertisers (user_id) VALUES (?)
    `,
    vars = [
      req.session.uid
    ],
    result = await db.query(sql, vars);

    if (!result.affectedRows) throw 'Could not create advertiser account';

    sql = `
      UPDATE users SET advertiser = 1 WHERE user_id = ?
    `,
    vars = [
      req.session.uid
    ],
    result = await db.query(sql, vars);

    db.release();

    if (!result.affectedRows) throw 'Could not update user';

    req.session.advertiser = true;
    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
  
}
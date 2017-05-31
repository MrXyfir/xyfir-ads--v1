const request = require('superagent');
const mysql = require('lib/mysql');

const config = require('config');

/*
  POST api/login
  REQUIRED
    xid: string, auth: string
  RETURN
    { error: bool }
  DESCRIPTION
    Attempt to login / register user
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    if (req.session.uid) throw 'Already logged in';

    const xyAcc = await request
      .get(config.addresses.xyAccounts + 'api/service/11/user')
      .query({
        key: config.keys.xyAccounts,
        xid: req.body.xid, token: req.body.auth
      });
    
    if (xyAcc.body.error) throw 'xyAccounts error: ' + xyAcc.body.message;

    await db.getConnection();

    let result,
    sql = `
      SELECT * FROM users WHERE xid = ?
    `,
    vars = [
      req.body.xid
    ],
    rows = await db.query(sql, vars);

    // Register user
    if (!rows.length) {
      const insert = {
        xid: req.body.xid,
        email: xyAcc.body.email
      };
      sql = `
        INSERT INTO users SET ?
      `,
      result = await db.query(sql, insert);

      if (!result.insertId) throw 'Could not create account';

      req.session.uid = result.insertId;
    }
    // Update / login user
    else {
      sql = `
        UPDATE users SET email = ? WHERE user_id = ?
      `,
      vars = [
        xyAcc.body.email, rows[0].user_id
      ],
      result = await db.query(sql, vars);

      if (!result.affectedRows) throw 'Could not update account';
      
      // Set session variables
      req.session.uid = rows[0].user_id;
      req.session.publisher = !!rows[0].publisher;
      req.session.advertiser = !!rows[0].advertiser;
    }

    db.release();
    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};
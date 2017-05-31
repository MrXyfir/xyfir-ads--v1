require('app-module-path').addPath(__dirname);

const SessionStore = require('express-mysql-session');
const uaParser = require('express-useragent').express;
const express = require('express');
const session = require('express-session');
const parser = require('body-parser');

const config = require('./config');
const app = express();

if (config.environment.type == 'dev') app.use(require('cors')());

/* Serve Static Files */
app.use('/static', express.static(__dirname + '/static'));

/* Body Parser */
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

/* User Agent Parser */
app.use('/click', uaParser());

/* Sessions */
app.use(
  session({
    secret: config.keys.session,
    store: new SessionStore({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      useConnectionPooling: true
    }),
    saveUninitialized: true,
    resave: true,
    cookie: {
      httpOnly: false
    }
  })
);

/* Auth Middleware */
app.use('/api/panel', (req, res, next) => {
  if (req.session.uid <= 1000)
    next();
  else
    res.json({ error: true, message: '' }); 
});
app.use('/api/advertisers', (req, res, next) => {
  if (req.session.advertiser || req.path.indexOf('register'))
    next();
  else
    res.json({ error: true, message: 'You are not an advertiser' });
});
app.use('/api/publishers', (req, res, next) => {
  if (req.session.publisher || req.path.indexOf('register'))
    next();
  else
    res.json({ error: true, message: 'You are not a publisher' });
});

/* Routes */
app.use('/', express.static(__dirname + '/public'));
app.use('/api', require('./controllers/'));

app.get('/*', (req, res) => {
  if (config.environment.type == 'dev') {
    req.session.uid = 1;
    req.session.advertiser = true;
    req.session.publisher = true;
  }
  res.sendFile(__dirname + '/views/App.html');
});

/* Start Cron Jobs */
if (config.environment.runCronJobs) require('./jobs/start')();

app.listen(config.environment.port, () =>
  console.log('~~Server running on', config.environment.port)
);
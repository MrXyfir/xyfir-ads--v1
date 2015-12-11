/// <reference path="typings/express-session/express-session.d.ts" />
/// <reference path="typings/body-parser/body-parser.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/request/request.d.ts" />
/// <reference path="typings/mysql/mysql.d.ts" />
/// <reference path="typings/node/node.d.ts" />

import express = require('express');
import session = require('express-session');
import parser = require('body-parser');
var sesStore = require('express-mysql-session');
var uaParser = require('express-useragent').express;
var config = require('./config');
var app = express();

/* Serve Static Files */
app.use(express.static(__dirname + '/public'));

/* Body Parser */
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

/* User Agent Parser */
app.use('/click', uaParser());

/* Sessions */
var sessionStore = new sesStore({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    useConnectionPooling: true
});
app.use(session({
    secret: config.secrets.session,
    store: sessionStore,
    saveUninitialized: true,
    resave: true,
    cookie: {
        httpOnly: false
    }
}));

/* View Engine */
app.set('view engine', 'jade');

/* Routes */
app.use('/', require('./routes/'));
app.use('/api', require('./routes/api/'));
app.use('/click', require('./routes/click'));
app.use('/panel', require('./routes/panel/'));
app.use('/publishers', require('./routes/publishers'));
app.use('/advertisers', require('./routes/advertisers'));

/* Start Cron Jobs */
if (config.runCronJobs) require("./jobs/start")();

app.listen(config.port, () => console.log('SERVER RUNNING'));
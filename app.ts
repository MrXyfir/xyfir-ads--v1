/// <reference path="typings/express-session/express-session.d.ts" />
/// <reference path="typings/body-parser/body-parser.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/request/request.d.ts" />
/// <reference path="typings/mysql/mysql.d.ts" />
/// <reference path="typings/node/node.d.ts" />

import express = require('express');
import session = require('express-session');
import parser = require('body-parser');
import config = require('./config');
var app = express();

/* Serve Static Files */
app.use(express.static(__dirname + '/public'));

/* Body Parser */
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

/* Sessions */

/* View Engine */
app.set('view engine', 'jade');

/* Routes */
app.use('/', require('./routes/'));
app.use('/api', require('./routes/api/'));
app.use('/click', require('./routes/click'));
app.use('/panel', require('./routes/panel/'));
app.use('/publishers', require('./routes/publishers'));
app.use('/advertisers', require('./routes/advertisers'));

app.listen(config.port, () => console.log('SERVER RUNNING'));
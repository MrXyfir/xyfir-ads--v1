require("app-module-path").addPath(__dirname);

const sesStore = require("express-mysql-session");
const uaParser = require("express-useragent").express;
const express = require("express");
const session = require("express-session");
const parser = require("body-parser");

const config = require("./config");
let app = express();

/* Serve Static Files */
app.use(express.static(__dirname + "/public"));

/* Body Parser */
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

/* User Agent Parser */
app.use("/click", uaParser());

/* Sessions */
const sessionStore = new sesStore({
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

/* Routes */
app.use("/", express.static(__dirname + "/public"));
app.use("/api", require("./controllers/"));

app.get("/*", (req, res) => {
    if (config.environment.type == "dev") {
        req.session.uid = 1;
    }
    res.sendFile(__dirname + "/views/App.html");
});

/* Start Cron Jobs */
if (config.environment.runCronJobs) require("./jobs/start")();

app.listen(config.environment.port, () => {
    console.log("~~Server running on", config.environment.port)
});
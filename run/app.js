require('dotenv').config();
const http = require('http');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('../routes');
const app = express();
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const cache_store = require('../app/cache/cache_store.js');
const crypto = require('crypto');
const connection = require('../app/database/config.js');
const flash = require('connect-flash');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const cluster = require('cluster');
const csrf = require('csurf');
const compression = require('compression');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

//if we in production, disable print statements...shouldn't be debugging in production
if(process.env.NODE_ENV === "production") {
    console.log = function(input) {};
}

//XXX sometimes rendering static files hangs, even though the GET request completes, maybe issue with middleware. Needs fixing

__dirname = __dirname + '/../';

function init(port) {
    app.use(compression());
    app.set('views', path.join(__dirname, '/views'));
    //move this near the top??? idk
    app.use(express.static(path.join(__dirname, 'public')));

    var handlebars = expressHandlebars.create({ 
        partialsDir  : [
            __dirname + '/views/partials'    
        ]
    });


    app.engine('handlebars', handlebars.engine);
    app.set('view engine', 'handlebars');

    // uncomment after placing your favicon in /public
    app.use(favicon(path.join(__dirname, '/public/stylesheets/assets/images', 'favicon.ico')));

    app.use(helmet());
    app.use(helmet.hidePoweredBy());

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    var sessionMiddleWare = session({
        secret: crypto.randomBytes(10).toString('hex'),
        resave: true,
        saveUninitialized: true,
        store : new RedisStore({
            host: process.env.HOST,
            port: process.env.REDIS_PORT || 6379,
            client: cache_store[0]
        })
    }); 
    app.use(sessionMiddleWare);

    //this middleware stores a csrf token in cookie
    app.use(csrf());
    http.globalAgent.maxSockets = Infinity;

    //handles back button problem of caching- reloads page every time to persist session
    app.use(function(req, res, next) {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    });

    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    require('../app/authentication/user-pass.js').passportAuth(passport);
    require('../routes')(app, passport);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    var httpServer = http.Server(app).listen(port, '0.0.0.0');
    var io = require(__dirname + 'app/sockets/socketServer.js')(httpServer, sessionMiddleWare);
    return httpServer;
}




//to disable clustering and ip hashing, comment below line and just call init(3000);
if(process.env.NODE_ENV === "test") {
    console.log("testing environment...");
    init(3000);
}
else {
    require('./cluster_node.js')(cluster, http, init(0), PORT);
}

//FIXME load testing does not work anymore because of csrf token
if(process.env.NODE_ENV === "loadtest") {
    var siege = require('siege');
    siege().on(PORT).concurrent(500).for(1000).times.withCookie.post('/login', {username: "billxiong24", pass:"pass"}).get('/home').attack();
}

module.exports = app;

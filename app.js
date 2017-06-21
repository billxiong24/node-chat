const http = require('http');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const app = express();
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
var cache_store = require('./app/cache/cache_store.js');
const crypto = require('crypto');
const connection = require('./app/database/config.js');
const flash = require('connect-flash');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const cluster = require('cluster');
//const sticky = require('socketio-sticky-session');

var PORT = process.env.PORT || 3000;

// view engine setup

app.set('views', path.join(__dirname, '/views'));

var handlebars = expressHandlebars.create({ 
    partialsDir  : [
        __dirname + '/views/partials'    
    ]
});


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(helmet());
app.use(helmet.hidePoweredBy());
//TODO include csrf token in frontend input fields

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sessionMiddleWare = session({
    secret: crypto.randomBytes(10).toString('hex'),
    resave: true,
    saveUninitialized: true,
    //store : new RedisStore({
        //host: process.env.HOST,
        //port: process.env.REDIS_PORT || 6379,
        //client: cache_store
    //})
}); 
app.use(sessionMiddleWare);

app.use(function(req, res, next) {
    if(req.session._csrf === undefined) {
        req.session._csrf = crypto.randomBytes(20).toString('hex');
    }
    return next();
});

http.globalAgent.maxSockets = Infinity;

/* Set up server side socket*/

//handles back button problem of caching- reloads page every time to persist session
app.use(function(req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('./app/authentication/user-pass.js').passportAuth(passport);
require('./routes/index')(app, passport);

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

//node clustering for muli threading
//var numCPUs = require('os').cpus().length;

//if(cluster.isMaster) {
    //console.log("master process");
    //for(var i = 0; i < numCPUs; i++) {
        //cluster.fork();
    //}
//}
//else {
    //console.log("child process");
//var options = {
    //num: 4
//};
//var server = sticky(options, function() {
    //httpServer.listen(PORT);
    //io.listen(httpServer);

    //return httpServer;
//}).listen(3000, function() {
    //console.log("hey");
//});

//}

var httpServer = http.Server(app);
var io = require(__dirname + '/app/sockets/socketServer.js')(httpServer, sessionMiddleWare);
httpServer.listen(PORT);

//LOAD TESTING
if(process.env.NODE_ENV === "loadtest") {
    var siege = require('siege');
    siege().on(PORT).concurrent(500).for(1000).times.withCookie.post('/login', {username: "billxiong24", pass:"pass"}).get('/home').attack();
}

module.exports = app;

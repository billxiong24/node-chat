require('dotenv').config({path: __dirname + '/../.env'});
var winston = require('../util/logger.js')(module);
const http = require('http');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('../api');
const app = express();
const flash = require('connect-flash');
const helmet = require('helmet');
const csrf = require('csurf');
const compression = require('compression');
const expressHandlebars = require('express-handlebars');

const PORT = process.env.API_PORT || 5000;
const HOST = process.env.HOST || 'localhost';

__dirname = __dirname + '/../';

function init(port) {
    app.use(compression());

    app.use(helmet());
    app.use(helmet.hidePoweredBy());
    var handlebars = expressHandlebars.create({
        partialsDir  : [
            __dirname + '/views/partials'
        ]
    });

    app.engine('handlebars', handlebars.engine);
    app.set('view engine', 'handlebars');

    if(process.env.NODE_ENV === 'test') {

        //if in testing mode, write logs to file, so it doesnt pollute test output
        var accessLogStream = fs.createWriteStream(path.join(__dirname, 'info.log'), {flags: 'a'});
        app.use(logger('dev', {
            stream: accessLogStream
        }));
    }
    else {
        app.use(logger('dev'));
    }


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    //handles back button problem of caching- reloads page every time to persist session
    app.use(function(req, res, next) {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    });

    app.use(flash());
    require('../api')(app);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        res.send("404 not found.");
        //next(err);
        next();
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
    return httpServer;
}

init(PORT);

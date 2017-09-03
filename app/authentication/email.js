var logger = require('../../util/logger.js')(module);
const connection = require('../database/config.js');
const nodemailer = require('nodemailer');
var transport;

//just 1 instance of transport object
if(!transport) {
    transport = nodemailer.createTransport({
        //host can be anything, gmail is easiest
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS 
        }
    });
}

function checkEmailVerified(req, res, next) {
    logger.debug(req.user, 'check email verified');
    if(!req.session) {
        res.redirect('/login');
    }
    else if(!req.user) {
        res.redirect('/login');
    }
    else if(parseInt(req.user.confirmed) === 1) {
        res.redirect('/home');
    }
    else {
        return next();
    }
}

function sendEmailConfirmation(email, hash, callback) {
    var mail_user = process.env.MAIL_USER;
    var options = {
        from: '"Workspace" <'+mail_user+'>',
        to: email,
        subject: 'Welcome!',
        html: '<h3>Welcome! Click the link below to confirm your account.</h3><br/> <p>This link will expire soon, so click it now.</p>'+
        '<a href="http://localhost:3000/confirm/'+hash+'">Click here to confirm your account</a>'
    };
    transport.sendMail(options, function(err, info) {
        if(err) {
            logger.error(err);
            return;
        }
        logger.info(info);
        callback(err, info);
    });
}

module.exports = {
    checkEmailVerified: checkEmailVerified,
    sendEmailConfirmation: sendEmailConfirmation
};

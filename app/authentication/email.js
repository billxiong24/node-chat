const connection = require('../database/config.js');
const nodemailer = require('nodemailer');
var transport;
if(!transport) {
    console.log("creating new transport object");
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
    if(!req.session){
        res.redirect('/login');
    }
    else if(!req.session.user) {
        res.redirect('/login');
    }
    else if(req.session.user.confirmed === 'true') {
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
        html: '<h1> hello welcome every one</h1> <a href="http://localhost:3000/confirm/'+hash+'">Click here to confirm your account</a>'
    };
    transport.sendMail(options, function(err, info) {
        if(err) {
            console.log(err);
            return;
        }
        console.log(info);
        callback(err, info);
    });
}

module.exports = {
    checkEmailVerified: checkEmailVerified,
    sendEmailConfirmation: sendEmailConfirmation
};

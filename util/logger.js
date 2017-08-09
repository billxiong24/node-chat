process.setMaxListeners(0);
var winston = require('winston');

function setLabel(moduleObj) {
    return moduleObj.filename;
}

module.exports = function(moduleObj) {

    var options = {
        level: 'debug',
        filename: 'info.log',
        label: setLabel(moduleObj),
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: false
    };

    var consoleOptions = Object.assign(options);

    consoleOptions.prettyPrint = true;
    consoleOptions.colorize = true;

    if(process.env.NODE_ENV === 'test') {
        return new winston.Logger({
            transports: [
                new winston.transports.File(options)
            ]
        });
    }
    return new winston.Logger({
        transports: [
            new winston.transports.File(options),
            new winston.transports.Console(consoleOptions)
        ]
    });
};

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

    winston.configure({
        transports: [
            new winston.transports.File(options),
            new winston.transports.Console(consoleOptions)
        ]
    });

    return winston;
};

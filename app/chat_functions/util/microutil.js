var micro = require('microtime');
var now = micro.now();
for (var i = 0; i < 100; i++) {
    var time = micro.now();
    var date = new Date(time/1000);

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var microseconds = time % 1000000;
    console.log(composeStamp(year, month, day, hour, minutes, seconds, microseconds));
}

function composeStampNow() {
    var time = micro.now();
    var date = new Date(time/1000);

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var microseconds = time % 1000000;

    return composeStamp(year, month, day, hour, minutes, seconds, microseconds);
}

function composeStamp(year, month, day, hour, minutes, seconds, microseconds) {
    month=checkSingle(month);
    day=checkSingle(day);
    hour=checkSingle(hour);
    minutes=checkSingle(minutes);
    seconds=checkSingle(seconds);
    microseconds = microToString(microseconds);

    return year + '-' + month + '-' + day + " " + hour+":"+minutes+":"+seconds+":"+microseconds;
}

function checkSingle(num) {
    return num < 10 ? '0'+num : num;
}

function microToString(microNum) {
    var formatted = microNum.toString();
    if(formatted.length >= 6) {
        return formatted;
    }

    var diff = 6 - formatted.length;
    for (var i = 0; i < diff; i++) {
        formatted = '0'+formatted;
    }
    return formatted;
}

module.exports = {
    composeStamp: composeStamp,
    composeStampNow: composeStampNow
};

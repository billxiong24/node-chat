var dateMap = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sept",
    10: "Oct",
    11: "Nov",
    12: "Dec"
};


var prevUser = null;
function renderLines(username, lineInfo, reverse=true) {
    if(lineInfo.length === 0) {
        return lineInfo;
    }

    var prevTime = null;
    var prevUser = null;
    for(var i = lineInfo.length - 1; i >= 0; i--) {

        lineInfo[i].direction = username === lineInfo[i].username ? "right" : "left";
        lineInfo[i].active = username === lineInfo[i].username ? "active" : "";
        lineInfo[i].viewUsername = (!prevUser || lineInfo[i].username !== prevUser) ? lineInfo[i].username : "";
        //temporary
        lineInfo[i].viewUsername = lineInfo[i].username;


        var time_stamp = lineInfo[i].stamp;
        //strip away micro seconds
        var date0 = new Date(time_stamp.substring(0, time_stamp.lastIndexOf(":")));
        var date1 = new Date();
        
        var date2 = date0.getTime();
        var date3 = date1.getTime();
        
        var minutesAgo = (date3-date2) / 1000 / 60;
        var hoursAgo = minutesAgo / 60;
        var daysAgo = hoursAgo / 24; 
        
        var minutes = Math.floor(minutesAgo);
        var hours = Math.floor(hoursAgo);
        var days = Math.floor(daysAgo);
        var years = Math.floor(daysAgo/365);

        if(prevTime !== null && Math.abs((minutes - prevTime)) < 20) {
            lineInfo[i].viewStamp = "";
        }
        else {
            lineInfo[i].viewStamp = getFormattedDate(date0);
            lineInfo[i].viewUsername = lineInfo[i].username;
        }

        prevTime = minutes;

        prevUser = lineInfo[i].username;
     }

    return reverse ? lineInfo.reverse() : lineInfo;
}

//hopefully no one sees this code
function getFormattedDate(d, years) {

    var minutes = d.getMinutes() / 10 < 1 ? "0"+d.getMinutes() : d.getMinutes();
    var hours = d.getHours() % 12 || 12;
    var ampm = d.getHours() > 12 ? "PM" : "AM";
    var yearDisplay = years > 0 ? d.getFullYear() : "";
    
    return [dateMap[d.getMonth()+1],
    d.getDate(),
    yearDisplay].join(' ')+' '+
    [hours,
    minutes].join(':') + " " + ampm;
}



module.exports = renderLines;

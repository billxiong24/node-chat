module.exports = function(lines) {
    for(var i = lines.length - 1; i >= 0; i--){
            var transDate = lines[i].viewStamp;
            if(!prevUser || lines[i].username !== prevUser) {
                if(username === lines[i].username) {
                       .right.chatline
                           #mess.authorname
                               .datechat= transDate
                               a.authorname(href='#')= lines[i].username
                           .chatmessage.active(style='text-align: left')= lines[i].message

                }
                else {
                       .left.chatline
                           #mess.authorname
                               .datechat= transDate
                               a.authorname(href='#')= lines[i].username
                           .chatmessage(style='text-align: left')= lines[i].message
                }
            }
            else {
                if(username === lines[i].username) {
                   .right.chatline
                       .chatmessage.active(style='text-align: left')= lines[i].message

                }
                else {
                   .left.chatline
                       .chatmessage(style='text-align: left')= lines[i].message
                }

            }
            prevUser = lines[i].username
    }
}

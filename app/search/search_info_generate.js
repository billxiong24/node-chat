require('dotenv').config({path: __dirname + '/../../.env'});
var connection = require('../database/config.js');
var fs = require('fs');

function generateData(callback) {
    //Gets Chats with num messages, num members, name, and id
    var query = "SELECT a1.id, a1.chat_name, a1.num_messages, a2.num_members FROM (SELECT id, COUNT(*) AS num_messages, Chat.chat_name FROM Chat LEFT JOIN ChatLines ON Chat.id = ChatLines.chat_id GROUP BY Chat.id, Chat.chat_name ORDER BY num_messages) AS a1 LEFT JOIN (SELECT id, COUNT(*) AS num_members FROM Chat LEFT JOIN MemberOf ON Chat.id = MemberOf.chat_id GROUP BY Chat.id ORDER BY num_members) AS a2 ON a1.id = a2.id";
    connection.execute(query, [], function(result) {

        var fileStream = fs.createWriteStream('./chat_data.json');
        fileStream.write('[\n');

        for(var i = 0; i < result.length; i++) {
            var messages = result[i].num_messages;
            var members = result[i].num_members;

            //SQL query sets columns as 1 if not found in database, should be 0
            result[i].num_messages = messages === 1 ? 0 : messages;
            result[i].num_members = members === 1 ? 0 : members;
    
            if(i != result.length - 1) {
                fileStream.write(JSON.stringify(result[i]) + ",\n");
            }
            else {
                fileStream.write(JSON.stringify(result[i]));
            }
        }

        fileStream.write(']\n');
        fileStream.end(function() {
            callback();
        });
    });
}

generateData(function() {
    process.exit(0);
});

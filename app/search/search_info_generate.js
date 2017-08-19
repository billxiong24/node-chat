require('dotenv').config({path: __dirname + '/../../.env'});
var logger = require('../../util/logger.js')(module);
var connection = require('../database/config.js');
var fs = require('fs');
var ChatSearchManager = require('./chat_search_manager.js');

//NOTE to get all data in elastic search, do http://localhost:9200/[index]/_search?pretty=true&q=*:*

function generateChatData() {
    //Gets Chats with num messages, num members, name, and id
    var query = "SELECT a1.id, a1.chat_name, a1.num_messages, a2.num_members FROM (SELECT id, COUNT(*) AS num_messages, Chat.chat_name FROM Chat LEFT JOIN ChatLines ON Chat.id = ChatLines.chat_id GROUP BY Chat.id, Chat.chat_name ORDER BY num_messages) AS a1 LEFT JOIN (SELECT id, COUNT(*) AS num_members FROM Chat LEFT JOIN MemberOf ON Chat.id = MemberOf.chat_id GROUP BY Chat.id ORDER BY num_members) AS a2 ON a1.id = a2.id";
    connection.execute(query, [], function(result) {

        for(var i = 0; i < result.length; i++) {
            var messages = result[i].num_messages;
            var members = result[i].num_members;
            //SQL query sets columns as 1 if not found in database, should be 0
            result[i].num_messages = messages === 1 ? 0 : messages;
            result[i].num_members = members === 1 ? 0 : members;
        }

        new ChatSearchManager().createBulkIndex(result, function(res) {
            logger.info("finished bulk index");
        });
    });
}

//TODO generate index and types for user data
function generateUserData(callback) {

}

generateChatData();

module.exports = {
    generateChatData: generateChatData
};

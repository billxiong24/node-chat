var logger = require('../../util/logger.js')(module);
var SearchManager = require('./search_manager.js');

var ChatSearchManager = function() {
    SearchManager.call(this, 'chat', 'chat_info');
};

ChatSearchManager.prototype = Object.create(SearchManager.prototype);
ChatSearchManager.prototype.constructor = ChatSearchManager;

ChatSearchManager.prototype.createDocument = function(chatInfoObj, callback) {
    var that = this;
    this.getClient().index({
        index: that._index,
        type: that._type,
        id: chatInfoObj.id,
        //TODO add suggestions to body
        body: {
            id: chatInfoObj.id,
            //HACK for some reason the chat.toJSON uses name field
            chat_name: chatInfoObj.chat_name || chatInfoObj.name,
            num_messages: chatInfoObj.num_messages || 0,
            num_members: chatInfoObj.num_members || 1
        }
    }, function(err, res) {
        logger.info(res, 'response');
        callback(err, res);
    });
};


//override
ChatSearchManager.prototype.search = function(searchTerm, from, callback) { 
    var client = this.getClient();
    var index = this.getIndex(); var type = this.getType();

    client.search({
        size: 10,
        //use for pagination, default 0
        from: 0,
        index: index,
        type: type,
        body: {
            query: {
                bool: {
                    should: [
                        {
                            range: {
                                num_members: {
                                    gt: 0
                                }
                            }
                        },
                        {
                            range: {
                                num_messages: {
                                    gt: 0
                                }
                            }

                        }
                    ],
                    must: [
                        {
                            match: {
                                chat_name: {
                                    query: searchTerm,
                                    minimum_should_match: 1,
                                    fuzziness: 2
                                }
                            }
                        }
                    ]
                }
            }
        }

    }, function(err, res) {
        //TODO need to check if elastic search is running, other wise returns undefined
        logger.info(res, 'search results');
        callback(err, res.hits);
    });
};

//var csm = new ChatSearchManager();

//csm.createDocument({
    //id: 345345,
    //chat_name: "hjowdy",
    //num_messages: 0,
    //num_members: 1
//}, function(err, res) {
    //logger.info("hi");
//});
//csm.incrementField(345345, 'num_messages', 1, function(err, res) {
    //logger.info(res);
    //logger.info('increment');
//});
//csm.search('hjowdy', function(err, res) {
    //logger.info(res);
//});


module.exports = ChatSearchManager;

var logger = require('../util/logger.js')(module);
var axios = require('axios');

var baseURL =  'http://' + process.env.HOST + '/';

function get(options) {
    /*{*/
        //method: 'get',
        //baseURL: baseURL,
        //url: '/api/chats/'+req.params.chatID,
        //params: req.user,
        //proxy: {
            //host: 'localhost',
            //port: 5000
        //}
    /*}*/
    return getPromise('get', options);
}

function post(options) {
/*{*/
        //method: 'post',
        //baseURL: 'http://localhost/',
        //url: '/api/chats/verify_chat',
        //data: {
            //username: req.session.user.username,
            //code: code,
            //chat_id: chat_id
        //},
        //proxy: {
            //host: 'localhost',
            //port: 5000
        //}
    /*}*/
    return getPromise('post', options);
}

function put(options) {
/*{*/
        //method: 'put',
        //baseURL: 'http://localhost/',
        //url: '/api/chats/' + req.params.chatID + '/updatedName',
        //data: {
            //newName: req.body.newName
        //},
        //proxy: {
            //host: 'localhost',
            //port: 5000
        //}
    /*}*/
    return getPromise('put', options);
}


function getPromise(reqType, options) {
    //TODO we can use load balancer here to balance request to different servers
    var reqObj = Object.assign({
        method: reqType,
        proxy: getProxy()

    }, options);

    return axios(reqObj);
}

function getProxy() {
    return {
        host: process.env.HOST,
        port: 5000
    };
}

module.exports = {
    get, post, put
};

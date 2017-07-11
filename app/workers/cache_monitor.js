const cache_functions = require('../cache/cache_functions.js');
const pq = cache_functions.processQueue;

//run as separate process
//kue uses redis as a backing store


//pq.createJob('flush_message', {
    //chat_id: "test",
    //num_messages: 3
//}, function(err) {
    //if(err) { console.log(err); return; }
//}, 5);

//this will wait for messages, and flush ALL jobs with same name
pq.processJob('flush_message', function(job, done) {
    console.log(job.data.chat_id, job.data.num_messages);
    return done();
}, 5);




module.exports = pq;

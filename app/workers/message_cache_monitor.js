require('dotenv').config({path: __dirname + '../../.env'});
const cache_functions = require('../cache/cache_functions.js');
const pq = cache_functions.processQueue;
var LineCache = require('../models/line_cache.js');

//kue uses redis as a backing store

//this will wait for messages, and flush ALL jobs with same name
module.exports = function() {

    pq.processJob('flush_message', function(job, done) {
        console.log(job.data.chat_id, job.data.num_messages);
        var lineCache = new LineCache(job.data.chat_id);

        lineCache.flush(job.data.num_messages);
        //only this process runs this, so no race conditionsm,
        //unless we add clustering, but that is overkill for now
        //TODO changed max number of completed jobs before cleaning
        pq.removeCompletedJobs(1);

        return done();
    }, 5);
};

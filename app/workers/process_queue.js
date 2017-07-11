const kue = require('kue');

var ProcessQueue = function(options = {
    prefix: 'q',
    redis: {
        port: 6379,
        host: process.env.HOST,
        auth: process.env.PASS
    }
}) {
    this._processQueue = kue.createQueue(options);

    setGlobalQueueEvents.call(this);
};

function setGlobalQueueEvents() {
    //remove jobs upon completion
    this._processQueue.on('job enqueue', function(id, type) {
        console.log("a job got enqueued from another process");

    }).on('job complete', function(id, result) {
        console.log("job completed");

        kue.Job.get(id, function(err, job) {
            if(err) {
                console.log(err);
                return err;
            }

            job.remove(function(err) {
                console.log("removed completed job");
            });
        });
    });
}

ProcessQueue.prototype.createJob = function(jobName, info, cb, attempts=3) {
    return this._processQueue.create(jobName, info).attempts(attempts).save(function(err) {
        cb(err);
    });
};

ProcessQueue.prototype.addJobEventHandler = function(job, event, cb) {
    return job.on(event, cb);        
};

ProcessQueue.prototype.processJob = function(jobName, cb, concurrency=1) {
    this._processQueue.process(jobName, concurrency, function(job, done) {
        cb(job, done);
    });
};



module.exports = ProcessQueue;

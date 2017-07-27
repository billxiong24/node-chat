const kue = require('kue');
/**
 * If we get an error job doesn't exist, its ok, it removes bad job and moves on,
 * dont get scared
 */
var ProcessQueue = function(options = {
    prefix: 'q',
    redis: {
        port: 6379,
        host: process.env.HOST
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
    });
    this._processQueue.failedCount(function( err, total ) {
        console.log("failed jobs: " + total);
    });
    this._processQueue.inactiveCount(function( err, total ) {
          console.log("inactive jobs: " + total);
    });
    this._processQueue.delayedCount(function( err, total ) {
          console.log("delayed jobs: " + total);
    });
    this._processQueue.completeCount(function( err, total ) {
          console.log("completed jobs: " + total);
    });
    this._processQueue.delayedCount(function( err, total ) {
          console.log("failjobs: " + total);
    });
    this._processQueue.on('error', function(err) {
        console.log("there was an error");
        return;

    });
}


ProcessQueue.prototype.monitorStuck = function() {
    this._processQueue.watchStuckJobs(2000);
    
};

ProcessQueue.prototype.removeCompletedJobs= function(max_completed) {
    this._processQueue.completeCount(function(err, completed) {
        console.log("completed jobs " + completed);
        if(completed < max_completed) { return; }
        
        kue.Job.rangeByState('complete', 0, completed, 'asc', function(err, jobs) {
            if(err) {
                console.log("tjere was an error");
                return;
            }
            jobs.forEach(function(job) {
                if(!job || !job.id) {
                    console.log("job doesn't exist anymore removing");
                    return;
                }
                job.remove(function() {
                    console.log("job removed " + job.id);
                });
            });
        });
    });
};

ProcessQueue.prototype.createJob = function(jobName, info, delay=100, attempts=3) {
    //fails if takes longer than 7 seconds 
    return this._processQueue.create(jobName, info)
        .attempts(attempts).ttl(7000).delay(delay).save(function(err) {
            if(err) {
                console.log(err);
            }
        }).on('failed', function(error) {
        console.log("job failed: " + error);
        //re enqueue failed job
        newJob.state('inactive').save(function(err) {
            console.log("error saving job", err);
        });
    });
};

//TODO use reduce to take in an array of callbacks
ProcessQueue.prototype.addJobEventHandler = function(job, event, cb) {
    return job.on(event, cb);
};

ProcessQueue.prototype.processJob = function(jobName, cb, concurrency=10) {
    this._processQueue.process(jobName, concurrency, function(job, done) {
        if(!job) {
            console.log("job does not exist");
            return;
        }
        cb(job, done);
    });
};

module.exports = ProcessQueue;

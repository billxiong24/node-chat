var logger = require('../../util/logger.js')(module);
const kue = require('kue');
const cache_store = ('../cache/cache_store.js');
var Redis = require('ioredis');
/**
 * If we get an error job doesn't exist, its ok, it removes bad job and moves on,
 * dont get scared
 */
const host = process.env.HOST || 'localhost';

var ProcessQueue = function(options = {
    prefix: 'q',
    redis: {
        createClientFactory: function () {
            //FIXME accessing this from cache_store throws error- as usual, no idea why
            return new Redis.Cluster([
                {
                    port: 6379,
                    host: host
                },
                {
                    port: 6380,
                    host: host
                },
                {
                    port: 6381,
                    host: host
                }
            ], {
                scaleRead: 'slave',
                enableOfflineQueue: true
            });
        }
    }
}) {
    this._processQueue = kue.createQueue(options);
    setGlobalQueueEvents.call(this);
};

function setGlobalQueueEvents() {
    //remove jobs upon completion
    this._processQueue.on('job enqueue', function(id, type) {
        logger.info("a job got enqueued from another process");

    }).on('job complete', function(id, result) {
        logger.info("job completed");
    });
    this._processQueue.failedCount(function( err, total ) {
        logger.info("failed jobs: " + total);
    });
    this._processQueue.inactiveCount(function( err, total ) {
          logger.info("inactive jobs: " + total);
    });
    this._processQueue.delayedCount(function( err, total ) {
          logger.info("delayed jobs: " + total);
    });
    this._processQueue.completeCount(function( err, total ) {
          logger.info("completed jobs: " + total);
    });
    this._processQueue.delayedCount(function( err, total ) {
          logger.info("failjobs: " + total);
    });
    this._processQueue.on('error', function(err) {
        logger.info("there was an error");
        return;

    });
}


ProcessQueue.prototype.monitorStuck = function() {
    this._processQueue.watchStuckJobs(2000);
    
};

ProcessQueue.prototype.removeCompletedJobs= function(max_completed) {
    this._processQueue.completeCount(function(err, completed) {
        logger.info("completed jobs " + completed);
        if(completed < max_completed) { return; }
        
        kue.Job.rangeByState('complete', 0, completed, 'asc', function(err, jobs) {
            if(err) {
                logger.err("tjere was an error");
                return;
            }
            jobs.forEach(function(job) {
                if(!job || !job.id) {
                    logger.err("job doesn't exist anymore removing");
                    return;
                }
                job.remove(function() {
                    logger.info("job removed " + job.id);
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
                logger.err(err);
            }
        }).on('failed', function(error) {
        logger.err("job failed: " + error);
        //re enqueue failed job
        newJob.state('inactive').save(function(err) {
            logger.debug("error saving job", err);
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
            logger.error("job does not exist");
            return;
        }
        cb(job, done);
    });
};

module.exports = ProcessQueue;

function ipHash(ip, numProcesses) {
    var num = "";
    for(var i = 0; i < ip.length; i++) {
        if(isNaN(ip[i])) {
            continue;
        }
        num+=ip[i];
    }

    //doublewise bit not
    return ~~num % numProcesses;
}

function addRespawnHandler(workers, cluster, index) {
    workers[index].on('exit', function(code, sig) {
        workers[index] = cluster.fork();
    });
}

module.exports = function(cluster, http, httpHiddenServer, PORT) {

    if(cluster.isMaster) {
        var workers = [];
        var numCPUs = require('os').cpus().length;

        for(var i = 0; i < numCPUs; i++) {
            workers[i] = cluster.fork();
            addRespawnHandler(workers, cluster, i);
        }
        
        //var options = {
            //key: fs.readFileSync(),
            //cert: fs.readFileSync()
        //};
         http.createServer().on('connection', function(conn) {
            conn.pause();
            if(conn.remoteAddress) {
                var hashIndex = ipHash(conn.remoteAddress, numCPUs);
                var worker = workers[hashIndex];
                worker.send("sticky-session", conn);
            }
        }).listen(PORT, '0.0.0.0');
    }
    else {

        //listen for message from master process
        process.on('message', function(message, conn) {
            if(message === 'sticky-session' && conn) {

                httpHiddenServer.emit('connection', conn);
                conn.resume();
            }
            else {
                console.log("There was an error with connection");
                
            }
        });
    }
};

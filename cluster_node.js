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

function addRespawnHandler(workers, index) {
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
            addRespawnHandler(workers, i);
        }
        
        var httpServer = http.createServer();
        httpServer.on('connection', function(conn) {
            conn.pause();
            if(conn.remoteAddress) {
                var hashIndex = ipHash(conn.remoteAddress, numCPUs);
                var worker = workers[hashIndex];
                worker.send("sticky-session", conn);
            }
        });

        httpServer.listen(PORT, '0.0.0.0');
    }
    else {

        process.on('message', function(message, conn) {
            if(message !== 'sticky-session') {
                return;
            }
            httpHiddenServer.emit('connection', conn);
            conn.resume();
        });
    }
};

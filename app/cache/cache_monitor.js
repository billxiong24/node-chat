const cache_functions = require('./cache_functions.js');

//super class for monitoring redis cache and evicting 
//keys based on some criteria determined by a function
var CacheMonitor = function(cacheObj) {
    this._cacheObj = cacheObj;
    this._monitorFunc = null;
};

CacheMonitor.prototype.monitor = function(interval) {
    this._monitorFunc(interval);
};

CacheMonitor.prototype.setMonitorFunction = function(monitorFunc) {
    this._monitorFunc = monitorFunc;    
};


module.exports = CacheMonitor;

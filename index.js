var express = require('express')
var express_obj = express()
var server = requre('http').createServer(express_obj)
var io = require('socket.io')(server)

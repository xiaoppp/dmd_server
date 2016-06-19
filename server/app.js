"use strict"

const restify = require('restify')

let server = restify.createServer()

server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable))
server.use(restify.authorizationParser())
//server.use(restify.dateParser());
//server.use(restify.queryParser());
//server.use(restify.jsonp());
server.use(restify.gzipResponse())
server.use(restify.bodyParser())
//server.use(restify.requestExpiry());




// add route
require('./route/route')(server)

// add all models
require('./mysql/index')


server.listen(3000, function() {
    console.log('%s listening at %s', server.name, server.url)
})

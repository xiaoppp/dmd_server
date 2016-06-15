"use strict"

const restify = require('restify')

let server = restify.createServer()

// add route
require('./route/route')(server)

require('./db/mongo')()

server.name = "zhekou server"
server.listen(3000, function() {
    console.log('%s listening at %s', server.name, server.url)
})

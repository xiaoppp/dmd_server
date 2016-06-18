"use strict"

const restify = require('restify')

let server = restify.createServer()

// need to mark later
// server.use(
//     function crossOrigin(req, res, next) {
//         // res.header("Access-Control-Allow-Origin", "*")
//         // res.header("Access-Control-Allow-Headers", "X-Requested-With")
//         res.setHeader('Access-Control-Allow-Origin', '*');
//         res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
//         res.setHeader('Access-Control-Allow-Methods', '*');
//         res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
//         res.setHeader('Access-Control-Max-Age', '1000');
//         return next()
//     }
// )

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

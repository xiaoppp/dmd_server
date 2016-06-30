"use strict"

const restify = require('restify')

let server = restify.createServer()

function unknownMethodHandler(req, res) {
    if (req.method.toLowerCase() === 'options') {
        console.log('received an options method request');
        var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'Authorization']; // added Origin & X-Requested-With & **Authorization**

        if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
        res.header('Access-Control-Allow-Methods', res.methods.join(', '));
        res.header('Access-Control-Allow-Origin', req.headers.origin);

        return res.send(200);
    } else
        return res.send(new restify.MethodNotAllowedError());
}

server.on('MethodNotAllowed', unknownMethodHandler);

server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable))
//server.use(restify.queryParser());
server.use(restify.gzipResponse())

server.use(function logger(req, res, next) {
    console.log(new Date(), req.method, req.url);
    next()
})

server.on('uncaughtException', function(req, res, route, error) {
    console.error(error.stack)
    res.send(error)
})

// add route
require('./route/route')(server)
    // add all models
const models = require('./mysql/index')
require('./models_extention/model')(models)

require('./util/configCache')

server.listen(3000, function() {
    console.log('%s listening at %s', server.name, server.url)
})

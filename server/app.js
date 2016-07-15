"use strict"

const os = require('os')
const fs = require('fs')
const restify = require('restify')
const util = require('util')
const log = require('./util/log')
const moment = require('moment')

const auth = require('./util/auth')

let server = restify.createServer()

// add route
require('./route/route')(server)
    // add all models
const models = require('./mysql/index')
require('./models_extention/model')(models)

require('./util/configCache')

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

server.on('MethodNotAllowed', unknownMethodHandler)

server.use(restify.CORS())
server.use(restify.fullResponse())
server.use(restify.acceptParser(server.acceptable))
server.use(restify.gzipResponse())
//server.use(restify.authorizationParser())
//server.use(restify.dateParser());
//server.use(restify.queryParser());
//server.use(restify.jsonp());

const c = require('./util/util')
c.sendSMS()

server.use(function logger(req, res, next) {
    console.log(new Date(), req.method, req.url)
    log.info(new Date(), req.method, req.url)
    next()
})

server.on('uncaughtException', function(req, res, route, error) {
    console.error(error.stack)
    log.error(error.stack)
    res.send(error)
})

server.listen(3000, function() {
    console.log(moment().format())
    console.log('%s listening at %s', server.name, server.url)
})

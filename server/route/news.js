"use strict"
const co = require('co')
const path = require('path')

const models  = require('../mysql/index')

module.exports = function(server) {
    server.get('/api/news/:newsid', findNewsById)
    server.get('/api/news', findNewsList)
}

const findNewsById = (req, res, next) => {
    models.dmd_news.findById(req.params.newsid).then(news => {
        res.send(news)
    })
}

const findNewsList = (req, res, next) => {
    models.dmd_news.findAll().then(news => {
        res.send(news)
    })
}

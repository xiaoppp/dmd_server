"use strict"
const co = require('co')
const path = require('path')

const models  = require('../mysql/index')

module.exports = function(server) {
    server.get('/api/news/page/:page', findNewsList)
    server.get('/api/news/:newsid', findNewsById)
}

const findNewsById = (req, res, next) => {
    models.dmd_news.findById(req.params.newsid).then(news => {
        res.send(news)
    })
}

const findNewsList = (req, res, next) => {
    const page = req.params.page - 1
    models.dmd_news.findAndCountAll({
        limit: 10,
        offset: 10 * page
    }).then(news => {
        res.send(news)
    })
}

"use strict"
const co = require('co')
const models  = require('../mysql/index')
const config = require('../config/config.json')

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

    const size = config.pagination.size

    models.dmd_news.findAndCountAll({
        limit: size,
        offset: size * page
    }).then(news => {
        res.send(news)
    })
}

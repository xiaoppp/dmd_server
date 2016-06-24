"use strict"
const co = require('co')
const models = require('../mysql/index')
const config = require('../config/config.json')
const util = require('../util/util')
const restify = require('restify')


module.exports = function(server) {
    server.get('/api/messages/page/:memberid/:page', findMessagesList)
    server.get('/api/messages/reply/:memberid', replyMessages)

    server.get('/api/message/:id', findMessagesById)
    server.post('/api/message/action/leavemsg', restify.jsonBodyParser(), saveMessage)
}

const findMessagesList = (req, res, next) => {
    const to_member_id = req.params.memberid
    const page = req.params.page - 1

    const size = config.pagination.size

    models.dmd_message
        .findAndCountAll({
            where: {
                to_member_id: to_member_id
            },
            limit: size,
            offset: size * page
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const replyMessages = (req, res, next) => {
    const member_id = req.params.memberid

    co(function*() {
            const messages = yield models.dmd_message.findAll({
                where: {
                    member_id: member_id
                }
            })

            const replys = yield messages.map(function*(m) {
                console.log(m.reply)
                const reply = yield models.dmd_message.findById(m.reply)
                return {
                    "old": m,
                    "new": reply
                }
            })
            return replys
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const findMessagesById = (req, res, next) => {
    models.dmd_message
        .findById(req.params.id)
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const saveMessage = (req, res, next) => {
    const leavemsg = models.dmd_message
        .create(req.params)
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

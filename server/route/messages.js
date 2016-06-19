"use strict"
const co = require('co')
const models = require('../mysql/index')
const config = require('../config/config.json')

module.exports = function(server) {
    server.get('/api/messages/page/:memberid/:page', findMessagesList)
    server.get('/api/messages/reply/:memberid', replyMessages)

    server.get('/api/message/:id', findMessagesById)
    server.post('/api/message/action/leavemsg', saveMessage)
}

const findMessagesList = (req, res, next) => {
    const to_member_id = req.params.memberid
    const page = req.params.page - 1

    const size = config.pagination.size

    models.dmd_message.findAndCountAll({
        where: {
            to_member_id: to_member_id
        },
        limit: size,
        offset: size * page
    }).then(messages => {
        res.send(messages)
    })
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

        res.send(replys)
    })
    .then(() => {})
    .catch(error => res.send("failed"))
}

const findMessagesById = (req, res, next) => {
    models.dmd_message.findById(req.params.id).then(messages => {
        // todo:  messages is null will report error need to check later
        messages = messages || []
        res.send(messages)
    })
}

const saveMessage = (req, res, next) => {
    console.log(req.params)
    console.log(req.body)

    const leavemsg = models.dmd_message
        .create(req.params)
        .then(function(message) {
            res.send(message)
        })
        .catch(error => res.send("failed"))
}

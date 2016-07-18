"use strict"
const co = require('co')
const models = require('../mysql/index')
const config = require('../config')
const util = require('../util/util')
const restify = require('restify')
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const verifyToken = require('../middlewares/restifyToken')


module.exports = function(server) {
    server.get('/api/messages/page/:page', verifyToken, findMessagesList)
    server.get('/api/messages/reply', verifyToken, replyMessages)

    server.get('/api/message/:id', verifyToken, findMessagesById)
    server.post('/api/message/action/leavemsg', verifyToken, restify.bodyParser({
        multipartFileHandler: uploadPicture
    }), upload)
}

const findMessagesList = (req, res, next) => {
    const to_member_id = req.memberid
    const page = req.params.page - 1
    const size = config.pagination.size

    console.log(page, "===========")
    if (page === -1) {
        models.dmd_message
            .findAndCountAll({
                where: {
                    to_member_id: to_member_id
                }
            })
            .then(m => util.success(res, m))
            .catch(error => util.fail(req, res, error))
    } else {
        models.dmd_message
            .findAndCountAll({
                where: {
                    to_member_id: to_member_id
                },
                limit: size,
                offset: size * page
            })
            .then(m => util.success(res, m))
            .catch(error => util.fail(req, res, error))
    }
}

const replyMessages = (req, res, next) => {
    const member_id = req.memberid

    co(function*() {
            const messages = yield models.dmd_message.findAll({
                where: {
                    member_id: member_id,
                    reply: {
                        $ne: 0
                    }
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
        .catch(error => util.fail(req, res, error))
}

const findMessagesById = (req, res, next) => {
    models.dmd_message
        .findById(req.params.id)
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const upload = (req, res) => {
    let message = req.params
    message.img = req.filespath
    const leavemsg = models.dmd_message
        .create(message)
        .then(m => {
            console.log(m)
            util.success(res, m)
        })
        .catch(error => util.fail(req, res, error))
}

const uploadPicture = (part, req, res, next) => {
    console.log(req.params)

    const dirs = "../upload/images/message"
    const filename = part.filename

    const fileExt = filename.split('.').pop();
    const files = req.memberid + "_" + moment().format('YYYYMMDDhhmmss') + '.' + fileExt

    const dir = path.join(__dirname, dirs, files)
    const writter = fs.createWriteStream(dir)

    if (part.mime === "image/png" || part.mime === "image/jpg" || part.mime === "image/jpeg" || part.mime === "image/gif") {
        part.pipe(writter)
    }
    req.filespath = files
}

"use strict"
const restify = require('restify')
const path = require('path')
const fs = require('fs')
const verifyToken = require('../middlewares/restifyToken')

module.exports = function(server) {
    server.post('/api/common/mobile/upload', verifyToken,restify.bodyParser({multipartFileHandler: uploadPicture}), upload)
}

const uploadPicture = (part, req, res, next) => {
    console.log(part)

    const dirs = "/var/www/html/images/payment"
    const filename = part.filename
    const dir = path.join(dirs, filename)
    const writter = fs.createWriteStream(dir)

    if (part.mime === "image/png" || part.mime === "image/jpg" || part.mime === "image/jpeg" || part.mime === "image/gif") {
        part.pipe(writter)
    }
    req.filespath = filename
    console.log(filename)
}

const upload = (req, res, next) => {
    console.log(req.filespath)
    if (req.filespath) {
        util.success(res, req.filespath)
    }else {
        util.fail(req, res, error)
    }
}


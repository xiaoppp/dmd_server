"use strict"

const auth = require('../util/auth')
const util = require('../util/util')

module.exports = function verify(req, res, next) {
    const token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']

    let result = auth.verifyToken(token)

    if (result.isSucceed) {
        req.userid = result.userid
        next()
    }
    else {
        util.fail(res, result.errorMessage)
    }
}

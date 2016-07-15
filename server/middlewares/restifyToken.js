"use strict"

const auth = require('../util/auth')
const util = require('../util/util')

module.exports = function verify(req, res, next) {
    const token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']

    let result = auth.verifyToken(token, function(result) {
        console.log(result)

        if (result.isSucceed) {
            const userid = result.decoded.userid
            const experied = result.decoded.exp

            console.log("userid", userid)
            console.log("experied", experied)

            //const userToken = userCache.getToken(userid)
            //console.log("usertoken", userToken)

            req.memberid = userid
            next()
        }
        else {
            if(result.name === 'TokenExpiredError') {
                util.fail(req, res, result.message, 406)
            }
            if (result.name === 'JsonWebTokenError') {
                util.fail(req, res, result.message, 405)
            }
        }
    })
}

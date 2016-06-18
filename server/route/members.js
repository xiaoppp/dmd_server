"use strict"
const co = require('co')

module.exports = function(server) {
    server.get('/api/member/:memberid', findMemberById)
}

const findMemberById = (req, res, next) => {
    const memberid = req.params.memberid
    User.findById(memberid).then(member => {
        res.send(member)
    })
}

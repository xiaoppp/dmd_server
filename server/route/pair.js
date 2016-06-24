"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')
const config = require('../config/config')
const restify = require('restify')

module.exports = function(server) {
    server.get('/api/pairs/failed/:memberid', findMemberFailedPairs)
}

const findMemberFailedPairs = (req, res, next) => {
    const memberid = req.params.memberid
    co(function*() {
        const member = yield models.dmd_members.findById(memberid)
        const orderby = member.type == 1 ? ['state', 'asc'] : ['the_time', 'desc']
        const pairs = yield models.dmd_unmatch_log.findAll({
            where: {
                om_id: memberid,
                am_id: memberid
            },
            order: [
                orderby
            ]
        })
        return yield pairs.map(function*(p) {
            const apply = yield models.members.findOne({
                where: {
                    id: p.om_id
                }
            })
            const offer = yield models.members.findOne({
                where: {
                    id: p.am_id
                }
            })
            return {
                pair : p,
                apply: apply,
                offer: offer
            }
        })
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))

}

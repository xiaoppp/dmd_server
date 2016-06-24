"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')
const config = require('../config/config')

module.exports = function(server) {
    server.get('/api/income/money/:memberid/:page', findMoney)
    server.get('/api/income/bonus/:memberid/:page', findBonus)
    server.get('/api/income/interest/:memberid/:page', findInterest)

    server.post('/api/income/receipt/:incomeid', restify.bodyParser({multipartFileHandler: upload}), uploadReceipt)
}

const uploadReceipt = (req, res, next) => {
    
}

const upload = (part, req, res, next) => {
    const dir = path.join(__dirname, "../upload", part.filename)
    console.log(dir)
    const writter = fs.createWriteStream(dir)

    if (part.mime === "image/png" || part.mime === "image/jpg" || part.mime === "image/jpeg" || part.mime === "image/gif") {
        part.pipe(writter)
    }
}

const findMoney = (req,res,next) => {
    const memberid = req.params.memberid
    const page = req.params.page
    findIncome(memberid, page, "money")
    .then(m => {
        util.success(res, m)
    })
    .catch(error => util.fail(res, error))
}

const findBonus = (req,res,next) => {
    const memberid = req.params.memberid
    const page = req.params.page
    findIncome(memberid, page, "bonus")
    .then(m => {
        util.success(res, m)
    })
    .catch(error => util.fail(res, error))
}

const findInterest = (req,res,next) => {
    const memberid = req.params.memberid
    const page = req.params.page
    findIncome(memberid, page, "interest")
    .then(m => {
        util.success(res, m)
    })
    .catch(error => util.fail(res, error))
}

const findIncome = (memberid, page, type) => {
    console.log('===============', page)
    const size = config.pagination.size
    return co(function*() {
        let result = {}

        const incomeCount = yield models.dmd_income.count({
            where: {
                member_id: memberid,
                type: type
            }
        })
        const errorCount = yield models.dmd_income_error.count({
            where: {
                member_id: memberid,
                type: type
            }
        })

        result.count = incomeCount + errorCount
        const offset = size / 2 * page
        console.log(offset)
        const limit = size / 2
        result.rows = yield models.sequelize.query(
            "select * from dmd_income where member_id="+memberid+" and type='"+type+"' union all select * from dmd_income_error where member_id="+memberid+" and type='"+type+"' order by the_time desc limit "+offset+","+limit
        )

        result.money_ice = yield models.dmd_offer_help.sum('income', {
            where: {
                member_id: memberid,
                state: 100,
                income: {
                    $gt: 0
                }
            }
        })
        result.money_apply = yield models.dmd_apply_help.sum('money', {
            where: {
                member_id: memberid,
                state: {
                    $lt: 100
                }
            }
        })
        result.bonus_ice = yield models.dmd_income.sum('money', {
            where: {
                member_id: memberid,
                ice: {
                    $gt: 0
                },
                type: "bonus"
            }
        })
        return result
    })

}

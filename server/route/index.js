"use strict"
const co = require('co')
const moment = require('moment')
const restify = require('restify')
const models = require('../mysql/index')
const util = require('../util/util')
const verifyToken = require('../middlewares/restifyToken')

module.exports = function(server) {
    server.get('/api/index/info', verifyToken, fetchMemberInfo)
    server.get('/api/index/refresh', verifyToken, refresh)
}

const fetchMemberInfo = (req, res, next) => {
    const memberid = req.memberid
    
    console.log('=================memberid//',memberid)
    
    co(function*() {
            let result = {
                showNews: true
            }
            result.member = yield models.dmd_members.findById(memberid)
            console.log("============team_ids")
            if (result.member.team_ids) {
                console.log(result.member.team_ids)
                result.member.team_ids = result.member.team_ids.replace(/^\,/, '')
                result.member.team_ids = result.member.team_ids.replace(/\,$/, '')
                result.teamScope = result.member.team_ids.split(',').length
            }

            result.config = models.dmd_config.getConfigAll()

            const news = yield models.dmd_news.latestNews()
            const hasLatestNews = yield models.dmd_news_log.hasLatestNews(memberid, news.id)
            if (!hasLatestNews)
                result.showNews = false

            // 取最后的播种总单
            result.lastOffer = yield models.dmd_offer_help.lastestOffer(memberid)
            if (result.offer) {
                result.offerPairs = yield result.offer.getPairs()
            }

            // 取最后的收获总单
            result.lastApply = yield models.dmd_apply_help.lastestApply(memberid)
            if (result.apply) {
                result.applyPairs = yield result.apply.getPairs()
            }

            // 冻结本金总额
            result.moneyFreeze = yield models.dmd_offer_help.memberFreezeIncome(memberid)
            // 冻结奖金总额
            result.bonusFreeze = yield models.dmd_income.memberFreezeBonus(memberid)

            result.moneyApply = yield models.dmd_apply_help.applyTotalMoney(memberid)

            return result
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(req, res, error))
}

const refresh = (req, res, next) => {
    const memberid = req.memberid

    co(function*() {
        let result = {}
        result.member = yield models.dmd_members.findById(memberid)
        // 冻结本金总额
        result.moneyFreeze = yield models.dmd_offer_help.memberFreezeIncome(memberid)
        // 冻结奖金总额
        result.bonusFreeze = yield models.dmd_income.memberFreezeBonus(memberid)
        result.moneyApply = yield models.dmd_apply_help.applyTotalMoney(memberid)
        return result
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(req, res, error))
}

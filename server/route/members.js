"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')

module.exports = function(server) {
    server.get('/api/index/info/:memberid', fetchMemberInfo)

    server.get('/api/member/:username', findMemberByName)
    server.get('/api/member/check/:mobile', checkMobile)

    server.get('/api/member/children/:parentid', findChildrenByParentId)

    server.post('/api/member/reset', resetPassword)

    server.post('/api/member/signin', signin)
    server.post('/api/member/signout', signout)
    server.post('/api/member/signup', signup)

    server.post('/api/member/edit/info', updateMember)
}

const resetPassword = (req, res, next) => {
    let username = req.params.username
    let mobile = req.params.mobile
    let pwd = req.params.pwd

    co(function*() {
        const member = models.dmd_members.findOne({
            where: {
                username: username
            }
        })

        if (member.state === 0) {
            throw new Exception("该会员被冻结")
        }

        member.pwd = util.getMd5(pwd)
        yield member.save()
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))
}

const fetchMemberInfo = (req, res, next) => {
    const memberid = req.params.memberid

    co(function*() {
            let result = {
                showNews: true
            }
            result.member = yield models.dmd_members
                .findById(memberid, {
                    attributes: {
                        include: [],
                        exclude: ['team_ids']
                    }
                })

            result.config6 = yield models.dmd_config.getConfig(6)
            result.config24 = yield models.dmd_config.getConfig(24)

            const news = yield models.dmd_news.latestNews()
            const hasLatestNews = yield models.dmd_news_log.hasLatestNews(memberid, news.id)

            console.log('====================>', hasLatestNews)
            if (hasLatestNews)
                result.showNews = false

            // 取最后的播种总单
            result.offer = yield models.dmd_offer_help.lastestOffer(memberid)
            if (result.offer) {
                const offerPairs = yield result.offer.getPairs()
                result.offerPairs = offerPairs.length
            }

            // 取最后的收获总单
            result.apply = yield models.dmd_apply_help.lastestApply(memberid)
            if (result.apply) {
                const applyPairs = yield result.apply.getPairs()
                result.applyPairs = applyPairs.length
            }

            // 冻结本金总额
            result.moneyFreeze = yield models.dmd_offer_help.memberFreezeIncome(memberid)
            console.log('====================>', result.incomeTotal)

            // 冻结奖金总额
            result.bonusFreeze = yield models.dmd_income.memberFreezeBonus(memberid)
            console.log('====================>', result.bonusTotal)

            return result
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const findMemberByName = (req, res, next) => {
    const username = req.params.username
    models.dmd_members
        .findOne({
            where: {
                username: username
            }
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const findChildrenByParentId = (req, res, next) => {
    const parentid = req.params.parentid

    models.dmd_members
        .findAll({
            where: {
                parent_id: parentid
            },
            attributes: {
                include: [],
                exclude: ['team_ids']
            }
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const checkMobile = (req, res, next) => {
    const mobile = req.params.mobile
    let message = util.APIResult()

    models.dmd_members
        .count({
            where: {
                username: mobile
            }
        })
        .then(c => {
            if (c > 0) {
                return util.fail(res, "失败，有重复号码")
            }
            util.success(res)
        })
        .catch(error => util.fail(res, error))
}

const signup = (req, res, next) => {
    const refer = req.params.refer
    let message = util.APIResult()

    co(function*() {
            let parent = yield models.dmd_members.findOne({
                where: {
                    username: refer
                }
            })

            if (!parent) {
                return util.fail(res, "推荐人不正确")
            }

            let member = req.params

            //delete member.refer
            member.pwd = util.getMD5(req.params.pwd)
            member.username = member.mobile
            member.pay_pwd = util.getMD5(req.params.pay_pwd)
            member.parent_id = parent.id
            member.level = parent.level + 1
            member.reg_time = moment().unix()

            member = yield models.dmd_members.create(member)

            //find parents
            const parents = yield models.dmd_members.findAllParents(parent.id)

            //update parents teamids
            yield models.dmd_members.updateAllParents(parents, member.id)

            return member
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const signin = (req, res, next) => {
    const username = req.params.username
    let pwd = req.params.pwd
    pwd = util.getMD5(pwd)

    console.log('================>', pwd)

    co(function*() {
            const member = yield models.dmd_members.findOne({
                where: {
                    username: username,
                    pwd: pwd
                }
            })

            if (member) {
                member.last_login_time = moment().unix()
                yield member.save()
                util.success(res, {
                    memberid: member.id,
                    token: null
                })
            } else {
                util.fail(res, '账号或密码错误')
            }
        })
        .then(() => {})
        .catch(error => util.fail(res, error))
}

const signout = (req, res, next) => {}

const updateMember = (req, res, next) => {
    let member = req.body

    models.dmd_members
        .save(member)
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

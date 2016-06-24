"use strict"
const co = require('co')
const moment = require('moment')
const restify = require('restify')
const models = require('../mysql/index')
const util = require('../util/util')

module.exports = function(server) {
    server.get('/api/index/info/:memberid', fetchMemberInfo)

    server.get('/api/member/info/:id', findMemberById)
    server.get('/api/member/:username', findMemberByName)
    //mobile是否重复
    server.get('/api/member/check/:mobile', checkMobile)

    //是否是首单新用户
    server.get('/api/member/check/new/:memberid', checkFirst)
    //下级人数
    server.get('/api/member/children/amount/:memberid', findChildrenAmount)
    //所有下级teamids
    server.get('/api/member/children/:parentid', findChildrenByParentId)

    server.post('/api/member/reset', restify.jsonBodyParser(), resetPassword)

    server.post('/api/member/signin', restify.jsonBodyParser(), signin)
    server.post('/api/member/signout', restify.jsonBodyParser(), signout)
    server.post('/api/member/signup', restify.jsonBodyParser(), signup)
    //修改会员资料
    server.post('/api/member/edit/info', restify.jsonBodyParser(), updateMember)
}

const checkFirst = (req, res, next) => {
    models.dmd_members.isNewMember(req.params.memberid)
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

            result.config2 = models.dmd_config.getConfig(2) //'2', '1000-3000-5000-10000-30000-50000', '播种可选金额（单位：元）'
            result.config3 = models.dmd_config.getConfig(3) //'3','500-100','收获最少金额 - 被整除数'
            result.config6 = models.dmd_config.getConfig(6) //'6', '0.01', '播种日利息'
            result.config24 = models.dmd_config.getConfig(24) //'24', '15', '投资周期（单位：天）'

            const news = yield models.dmd_news.latestNews()
            const hasLatestNews = yield models.dmd_news_log.hasLatestNews(memberid, news.id)

            if (!hasLatestNews)
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

            result.moneyApply = yield models.dmd_apply_help.applyTotalMoney(memberid)

            return result
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const findChildrenAmount = (req, res, next) => {
    const memberid = req.params.memberid
    models.dmd_members.findById(memberid)
    .then(m => {
        const ids = m.team_ids
        const idslist = ids.split(',')
        util.success(res, idslist.length)}
    )
    .catch(error => util.fail(res, error))
}

const findMemberById = (req, res, next) => {
    const memberid = req.params.id
    models.dmd_members.findById(memberid, {
            attributes: {
                include: ['mobile', 'truename']
            }
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
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

    co(function*() {
            const members = yield models.dmd_members
                .findAll({
                    where: {
                        parent_id: parentid
                    },
                    attributes: {
                        include: [],
                        exclude: ['team_ids']
                    }
                })
            members.map(m => {
                let c = {
                    id: m.id,
                    name: m.truename,
                    member: m
                }
                return c
            })
            return members
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
                yield Promise.reject('推荐人不正确')
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
                return {
                    memberid: member.id,
                    token: null
                }
            } else {
                yield Promise.reject('账号或密码错误');
            }
        })
        .then(m => util.success(res, m))
        .catch(error => {
            console.log(error)
            util.fail(res, error)
        })
}

const signout = (req, res, next) => {}

const updateMember = (req, res, next) => {

    let member = req.body
    const id = req.params.id
    const pay_pwd = util.getMD5(req.body.pay_pwd)
    const weixin = req.body.weixin
    const alipay = req.body.alipay
    const bank_num = req.body.bank_num

    co(function*() {
            const findmember = yield models.dmd_members.findById(id)

            let findbankNum = yield models.dmd_members.findOne({
                where: {
                    bank_num: bank_num,
                    id: {
                        $ne: id
                    }
                }
            })

            if (findbankNum) {
                yield Promise.reject('银行卡号重复')
            }

            let findWeiXin = yield models.dmd_members.findOne({
                where: {
                    weixin: weixin,
                    id: {
                        $ne: id
                    }
                }
            })

            if (findWeiXin) {
                yield Promise.reject('微信账号重复')
            }

            let findalipay = yield models.dmd_members.findOne({
                where: {
                    alipay: alipay,
                    id: {
                        $ne: id
                    }
                }
            })

            if (findalipay) {
                yield Promise.reject('支付宝账号重复')
            }

            if (findmember.pay_pwd !== pay_pwd) {
                yield Promise.reject('安全密码错误')
            }

            console.log('===================')

            if (findmember) {
                return yield findmember.updateAttributes(member)
            }
        })
        .then(m => util.success(res, m))
        .catch(error => {
            console.log(error)
            util.fail(res, error)
        })
}

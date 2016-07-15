"use strict"
const co = require('co')
const moment = require('moment')
const restify = require('restify')
const models = require('../mysql/index')
const util = require('../util/util')
const verifyToken = require('../middlewares/restifyToken')

module.exports = function(server) {
    server.get('/api/member/info/:id', verifyToken, findMemberById)
    server.get('/api/member/:username', verifyToken, findMemberByName)
    //mobile是否重复
    server.get('/api/member/check/:mobile', verifyToken, checkMobile)

    //是否是首单新用户
    server.get('/api/member/check/new', verifyToken, checkFirst)
    //下级人数
    server.get('/api/member/children/amount', verifyToken, findChildrenAmount)
    //所有下级teamids
    server.get('/api/member/children/:parentid', verifyToken, findChildrenByParentId)

    server.post('/api/member/pwd/reset', verifyToken, restify.jsonBodyParser(), resetPwd)
    server.post('/api/member/paypwd/reset', verifyToken, restify.jsonBodyParser(), resetPaypwd)
    server.post('/api/member/smspwd/reset', verifyToken, restify.jsonBodyParser(), resetSmspwd)

    server.post('/api/member/signin', restify.jsonBodyParser(), signin)
    server.post('/api/member/signout', restify.jsonBodyParser(), signout)
    server.post('/api/member/signup', restify.jsonBodyParser(), signup)
    //修改会员资料
    server.post('/api/member/edit/info', verifyToken, restify.jsonBodyParser(), updateMember)
}

const checkFirst = (req, res, next) => {
    models.dmd_members.isNewMember(req.memberid)
        .then(m => util.success(res, m))
        .catch(error => util.fail(req, res, error))
}

const findChildrenAmount = (req, res, next) => {
    const memberid = req.memberid
    models.dmd_members.findChildrenAmount(memberid)
        .then(m => {
            util.success(res, m)}
        )
        .catch(error => util.fail(req, res, error))
}

const findMemberById = (req, res, next) => {
    const memberid = req.memberid
    models.dmd_members.findById(memberid, {
            attributes: {
                include: ['mobile', 'truename']
            }
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(req, res, error))
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
        .catch(error => util.fail(req, res, error))
}

const findChildrenByParentId = (req, res, next) => {
    const parentid = req.params.parentid

    co(function*() {
            let members = yield models.dmd_members
                .findAll({
                    where: {
                        parent_id: parentid
                    }
                })
            members = members.map(m => {
                m.setDataValue('teamCount', 0)
                if (m.team_ids && m.team_ids !== "0") {
                    m.team_ids = m.team_ids.replace(/^\,/, '')
                    m.team_ids = m.team_ids.replace(/\,$/, '')
                    const teamCount = m.team_ids.split(',').length
                    m.setDataValue('teamCount', teamCount)
                }
                return m
            })
            return members
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(req, res, error))
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
        .catch(error => util.fail(req, res, error))
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
        .catch(error => util.fail(req, res, error))
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
        .catch(error => util.fail(req, res, error))
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
        .catch(error => util.fail(req, res, error))
}

const resetPwd = (req, res, next) => {
    let memberid = req.memberid
    let oldpwd = req.params.oldpwd
    let pwd = req.params.pwd
    let repwd = req.params.repwd
    let paypwd = req.params.paypwd

    co(function*() {
            const member = yield models.dmd_members.findById(memberid)

            if (member.state === 0) {
                yield Promise.reject('该会员被冻结')
            }

            if (!pwd || !repwd || !paypwd) {
                yield Promise.reject('安全密码不能为空')
            }

            if (member.pwd === oldpwd) {
                yield Promise.reject('原密码输入错误')
            }

            if (pwd !== repwd) {
                yield Promise.reject('密码输入不一致')
            }

            if (member.pay_pwd !== paypwd)
            {
                yield Promise.reject('安全密码输入错误')
            }

            member.pwd = util.getMd5(pwd)
            yield member.save()
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(req, res, error))
}

const resetPaypwd = (req, res, next) => {
    let memberid = req.memberid
    let repaypwd = req.params.repaypwd
    let paypwd = req.params.paypwd

    co(function*() {
            const member = yield models.dmd_members.findById(memberid)

            if (member.state === 0) {
                yield Promise.reject('该会员被冻结')
            }

            if (!reqaypwd || !paypwd) {
                yield Promise.reject('安全密码不能为空')
            }

            if (repaypwd !== paypwd) {
                yield Promise.reject('两次输入的安全密码不一致')
            }

            if (member.pwd === paypwd)
            {
                yield Promise.reject('安全密码不能与登录密码一样')
            }

            member.pwd = util.getMd5(pwd)
            yield member.save()
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(req, res, error))
}

const resetSmspwd = (req, res, next) => {

}

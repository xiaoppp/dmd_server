"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')

module.exports = function(server) {
    server.get('/api/member/:memberid', findMemberById)
    server.get('/api/member/memberinfo/:memberid', fetchMemberInfo)

    server.post('/api/member/signin', signin)
    server.post('/api/member/signout', signout)
    server.post('/api/member/signup', signup)
}

const fetchMemberInfo = (req, res, next) => {
    const memberid = req.params.memberid

    co(function*() {
            let result = {
                showNews: true
            }
            result.member = yield models.dmd_members.findById(memberid)

            const news = yield models.dmd_news.findOne({
                order: [ ['the_time', 'DESC'] ]
            })

            const newslog = yield models.dmd_news_log.count({
                where: {
                    member_id: memberid,
                    news_id: news.id
                }
            })

            if (newslog === 0)
                result.showNews = false

            yield model.dmd_offer_help


            //models.dmd_apply_help.findAll()
        })
        .then(() => {})
        .catch(error => res.send('failed'))

}

const findMemberById = (req, res, next) => {
    const memberid = req.params.memberid
    models.dmd_members.findById(memberid).then(member => {
        res.send(member)
    })
}

const signin = (req, res, next) => {
    const username = req.params.username
    let pwd = req.params.pwd
    pwd = util.getMD5(pwd)
    console.log(pwd)

    co(function*() {
            const member = yield models.dmd_members.findOne({
                where: {
                    username: username,
                    pwd: pwd
                }
            })

            let message = util.APIResult()

            if (member) {
                member.last_login_time = moment().unix()
                yield member.save()
                message.isSuccess = true
            } else {
                message.isSuccess = false
                message.error.message = '账号或密码错误'
            }

            res.send(message)
        })
        .then(() => {})
        .catch(error => {
            console.log(error)
            res.send('failed')
        })
}

const signout = (req, res, next) => {
}

const signup = (req, res, next) => {
}

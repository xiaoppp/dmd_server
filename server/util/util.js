'use strict'
const crypto = require('crypto')
const log = require('./log')
const request = require('request')
const urlencode = require('urlencode')

const getMD5 = (mobile) => {
    console.log(mobile)
    const a = crypto.createHash('md5').update(mobile).digest('hex')
    const b = crypto.createHash('sha1').update('tq2bf3Vx1qSnp' + mobile).digest('hex')
    const c = crypto.createHash('md5').update(a + b).digest('hex')
    const d = crypto.createHash('md5').update('uEF4d3cVbHDm2UuM9ew2Afn6kx7xC9gi2' + c).digest('hex')
    const e = crypto.createHash('md5').update(d + '5iYn5wUg0dNx2pncm%7LdGEuT-er5a6').digest('hex')
    return e
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fail = (req, res, errorMessage, code) => {
    log.error({
        req: req
    }, 'error request');
    log.error({
        res: res
    }, errorMessage)

    console.log(errorMessage)

    code == undefined || 0
    const message = {
        isSuccess: false,
        error: {
            message: errorMessage,
            code: code
        }
    }
    res.send(message)
}

const success = (res, data) => {
    data == undefined || {}
    const message = {
        isSuccess: true,
        data: data
    }
    res.send(message)
}

//const c = require('./util/util')
//util.sendSMS(['13610857121'], "多米多欢迎你", (m) => console.log(m))
//const canSendSMS = false

const sendSMS = (mobiles, text, fn) => {
    const Uid = "duomiduo"
    const key = "72d9200fb6db26aea474"
    const smsText = urlencode(text)

    mobiles.forEach(m => {
        let url = "http://utf8.sms.webchinese.cn/?Uid=duomiduo&Key=72d9200fb6db26aea474&smsMob=" + m + "&smsText=" + smsText
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                fn(body)
            }
        })
    })
}

//to is the id of a member.
const sendSMSForPayment = (to) => {
    let canSendSMS = models.dmd_config.getConfig(11)
    if(canSendSMS == 1){
        let overTimeToReceipt = models.dmd_config.getConfig(13)
        let toMember = models.dmd_members.findById(to)
        let msg = "尊敬的会员" + toMember.nickname + 
                    "您好！您的申请帮助对方已经打款成功，请在" + overTimeToReceipt + 
                    "小时内进行确认收款操作！超出时间会被封号！"
        sendSMS([toMember.mobile], msg, function(res){
            console.log('...sms...sendSMSForPayment//', res)
        })
    }
}

//to is the id of a member.
const sendSMSForOffer = (to) => {
    let canSendSMS = models.dmd_config.getConfig(11)
    if(canSendSMS == 1){
        let overTimeToPay = models.dmd_config.getConfig(12)
        let toMember = models.dmd_members.findById(to)
        let msg = "尊敬的会员" + toMember.nickname + 
                    "您好！您的提供帮助订单已匹配成功，请您尽快登录系统查看详细信息！请尽量在" + overTimeToPay + 
                    "小时内进行操作！超出时间会被封号！"
        sendSMS([toMember.mobile], msg, function(res){
            console.log('...sms...sendSMSForPayment//', res)
        })
    }
}

//to is the id of a member.
const sendSMSForRegister = (to) => {
}

//to is the id of a member.
const sendSMSForAutoMatch = (to) => {
}

const util = {
    getMD5: getMD5,
    success: success,
    fail: fail,
    getRandomInt: getRandomInt,
    sendSMS: sendSMS,
    sendSMSForPayment: sendSMSForPayment,
    sendSMSForOffer : sendSMSForOffer,
    sendSMSForRegister : sendSMSForRegister,
    sendSMSForAutoMatch : sendSMSForAutoMatch
}

module.exports = util

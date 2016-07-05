'use strict'

const co = require('co')
const jwt = require('jsonwebtoken')
const moment = require('moment')

// generate new token and set to token cache
// userid = 803213706
const getToken = (userid) => {
    userid = 803213706
    // iss: 该JWT的签发者
    // sub: 该JWT所面向的用户
    // aud: 接收该JWT的一方
    // exp(expires): 什么时候过期，这里是一个Unix时间戳
    // iat(issued at): 在什么时候签发的
    const token = jwt.sign({userid: userid}, 'AK@E$23D1FC&*VV#B123@#ASFAD', {expiresIn: 60 * 24 * 7});
    console.log('===================>', token)
    tokenCache.setToken(userid, token)
    return token
}

// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjgwMzIxMzcwNiwiaWF0IjoxNDY3MTA1Nzg4LCJleHAiOjE0NjcxMDcyMjh9.EibVffhtzYnQCo_0KJWmATiLXZV7MNK6beoPzXVaNO8"
const verifyToken = (token) => {
    const decoded = jwt.verify(token, 'AK@E$23D1FC&*VV#B123@#ASFAD')

    const userid = decoded.userid
    const experied = decoded.exp
    //const userToken = tokenCache.getToken(userid)

    console.log("userid", userid)
    console.log("experied", experied)
    console.log("usertoken", userToken)

    let result = {
        userid: userid,
        isSucceed: true,
        errorMessage: ""
    }

    if (!userToken) {
        console.log('authorized failed, 口令失效')
        result.errorMessage = 'authorized failed, 口令失效',
        result.isSucceed = false
    }

    // 找到的用户token和当前用户传递的token不符合
    if (userToken !== token) {
        console.log('authorized failed, 已在其它地方登录')
        result.errorMessage = 'authorized failed, 已在其它地方登录',
        result.isSucceed = false
    }

    // token 过期了
    if (moment().unix() > experied) {
        console.log('authorized failed, token已经过去，请重新登录')
        result.errorMessage = 'authorized failed, token已经过期，请重新登录',
        result.isSucceed = false
    }

    return result
}

// const token = getToken()
// verifyToken(token)

module.exports = {
    getToken: getToken,
    verifyToken: verifyToken
}

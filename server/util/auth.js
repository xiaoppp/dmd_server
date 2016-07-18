'use strict'

const co = require('co')
const jwt = require('jsonwebtoken')
const moment = require('moment')

// generate new token and set to token cache
// userid = 803213706
const getToken = (userid) => {
    //userid = 803213706
    // iss: 该JWT的签发者
    // sub: 该JWT所面向的用户
    // aud: 接收该JWT的一方
    // exp(expires): 什么时候过期，这里是一个Unix时间戳
    // iat(issued at): 在什么时候签发的
    const token = jwt.sign({userid: userid}, 'AK@E$23D1FC&*VV#B123@#ASFAD', {expiresIn: "30 days"});
    console.log('===================>', token)
    return token
}

// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjgwMzIxMzcwNiwiaWF0IjoxNDY3MTA1Nzg4LCJleHAiOjE0NjcxMDcyMjh9.EibVffhtzYnQCo_0KJWmATiLXZV7MNK6beoPzXVaNO8"
const verifyToken = (token, fn) => {
    const decoded = jwt.verify(token, 'AK@E$23D1FC&*VV#B123@#ASFAD', function(err, decoded) {
        if (err) {
            return fn({isSucceed: false, error: err})
        }
        return fn({isSucceed: true, decoded: decoded})
    })
}

module.exports = {
    getToken: getToken,
    verifyToken: verifyToken
}

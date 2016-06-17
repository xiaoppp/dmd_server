"use strict"
const co = require('co')
const Sequelize = require('sequelize')
const dbo = require("../mysql/dbo")
const Member = require('../models/dmd_members')(dbo, Sequelize)

module.exports = function(server) {
    server.get('/user/:userid', findMemberById)
    server.post('/user', updateMember)
}

const findMemberById = (req, res, next) => {
    console.log('=======get user=======')
    console.log(req.params.userid)

    User.findById(req.params.userid).then(user => {
        res.send(user)
    })
    next()
}

const updateMember = (req, res, next) => {
    console.log('=======post user=======')
    console.log(req.params)

    const userid = req.params.userid
    const nick = req.params.nick

    console.log(userid)

    co(function* () {
        try {
            let user = yield User.findById(userid)
            console.log( "============" , user)
            user.nick = nick

            yield user.save()
        } catch (err) {
            console.error(err);
        }
    }).then(() => {
        res.send("successfully")
    });
    next()
}

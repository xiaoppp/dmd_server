"use strict"

module.exports = function (server) {
    server.get('/api/test', (req, res, next) => {
        res.send("welcome duomiduo backend api server...")
    });

    require("./exchange")(server)
    // require("./common")(server)
    // require("./index")(server)
    // require("./members")(server)
    // require("./news")(server)
    // require("./messages")(server)
    // require("./apply")(server)
    // require("./income")(server)
    // require("./offer")(server)
    // require("./pair")(server)
}

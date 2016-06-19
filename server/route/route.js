"use strict"

module.exports = function (server) {
    server.get('/', (req, res, next) => {
        res.send("welcome duomiduo backend api server...")
    });

    require("./common")(server)
    require("./members")(server)
    require("./news")(server)
    require("./messages")(server)
}

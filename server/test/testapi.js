{
    leavemsg: {
        url: "http://localhost:3000/api/message/leavemsg",
        json: {
            "to_member_id": 0,
            "title": "忘记安全密码",
            "content": "你好！ 忘记安全密码怎么办， 谢谢！",
            "msgtype": "ask",
            "member_id": 362,
            "state": 0
        }
    },
    signin: {
        url: "http://localhost:3000/api/member/signin",
        json: {"username":"fdsf","pwd":"tadd"}
    }
}

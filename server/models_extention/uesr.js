

// lastest 
class User {
    constructor(member, applys, offers) {
        this.memberid = member.id
        this.applys = applys
        this.offers = offers

        if (offers && offers.length > 0) {
            this.lastOffer = offers[0]
        }
        if (applys && applys.length > 0) {
            this.lastApply = applys[0]
        }

        for (apply of applys) {

        }
    }
}

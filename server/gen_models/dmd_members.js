module.exports = function(sequelize, DataTypes) {
    return sequelize.define('dmd_members', {
        id: {
            type: DataTypes.INTEGER(10),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: true
        },
        truename: {
            type: DataTypes.STRING,
            allowNull: true
        },
        sex: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '1'
        },
        pwd: {
            type: DataTypes.STRING,
            allowNull: true
        },
        pay_pwd: {
            type: DataTypes.STRING,
            allowNull: true
        },
        parent_id: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            defaultValue: '0'
        },
        rank: {
            type: DataTypes.INTEGER(6),
            allowNull: true,
            defaultValue: '0'
        },
        level: {
            type: DataTypes.INTEGER(6),
            allowNull: true,
            defaultValue: '1'
        },
        money: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: '0.00'
        },
        bonus: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: '0.00'
        },
        interest: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: '0.00'
        },
        believe: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            defaultValue: '0'
        },
        active: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            defaultValue: '0'
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: true
        },
        weixin: {
            type: DataTypes.STRING,
            allowNull: true
        },
        alipay: {
            type: DataTypes.STRING,
            allowNull: true
        },
        qq: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bank: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bank_addr: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bank_num: {
            type: DataTypes.STRING,
            allowNull: true
        },
        img: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'default.jpg'
        },
        reg_time: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        last_login_time: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        last_interest_time: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            defaultValue: '0'
        },
        actived: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        },
        up: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        },
        state: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '1'
        },
        ok: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        },
        team_ids: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        team_add_bool: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        },
        black: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        },
        xy: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        }
    }
    , {
        instanceMethods: {
            toJSON: function() {
                var values = this.get()
                delete values.pwd
                delete values.pay_pwd
                delete values.team_ids
                return values
            }
        },
        tableName: 'dmd_members',
        timestamps: false
    });
};

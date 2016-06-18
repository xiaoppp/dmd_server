/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_unmatch_log', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    oid: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      defaultValue: '0'
    },
    aid: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      defaultValue: '0'
    },
    om_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    am_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    money: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: '0.00'
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true
    },
    the_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    pay_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    end_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    state: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '2'
    },
    judge: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    parent_id: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    remark: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      defaultValue: '0'
    },
    order_money: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: '0.00'
    },
    order_the_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      defaultValue: '0'
    },
    unmatch_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    intro: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'dmd_unmatch_log'
  });
};

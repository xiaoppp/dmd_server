/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_admin_modify_money_log', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    member_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'money'
    },
    money: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    to_money: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    gap: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    the_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    }
  }, {
    tableName: 'dmd_admin_modify_money_log'
  });
};

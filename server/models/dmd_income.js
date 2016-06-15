/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_income', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    member_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    money: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    intro: {
      type: DataTypes.STRING,
      allowNull: true
    },
    the_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    ice: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      defaultValue: '0'
    },
    offer_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      defaultValue: '0'
    },
    apply_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'dmd_income'
  });
};

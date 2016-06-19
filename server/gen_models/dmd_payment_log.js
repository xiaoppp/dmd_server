/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_payment_log', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    oaid: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    member_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    to_member_id: {
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
    }
  }, {
    tableName: 'dmd_payment_log',
    timestamps: false
  });
};

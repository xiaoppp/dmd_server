/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_last_time', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    val: {
      type: DataTypes.STRING,
      allowNull: true
    },
    intro: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'dmd_last_time',
    timestamps: false
  });
};

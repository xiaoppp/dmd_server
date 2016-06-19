/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_ice_log', {
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
    intro: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    the_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    }
  }, {
    tableName: 'dmd_ice_log',
    timestamps: false
  });
};

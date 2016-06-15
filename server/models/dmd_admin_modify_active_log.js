/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_admin_modify_active_log', {
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
    active: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    to_active: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    gap: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    the_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    }
  }, {
    tableName: 'dmd_admin_modify_active_log'
  });
};

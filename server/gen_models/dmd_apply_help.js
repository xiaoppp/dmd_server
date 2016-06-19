/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_apply_help', {
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
    member_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    money: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: '0.00'
    },
    the_time: {
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
      defaultValue: '1'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    scramble: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    match_all: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    deny_count: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'dmd_apply_help',
    timestamps: false
  });
};

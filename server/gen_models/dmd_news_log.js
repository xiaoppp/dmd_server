/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dmd_news_log', {
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
    news_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    }
  }, {
    tableName: 'dmd_news_log',
    timestamps: false
  });
};

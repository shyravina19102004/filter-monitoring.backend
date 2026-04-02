'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    static associate(models) {
      Log.belongsTo(models.User, { foreignKey: 'userId', as: 'user', constraints: false });
    }
  }
  Log.init({
    userId: DataTypes.INTEGER,
    action: DataTypes.STRING,
    module: DataTypes.STRING,
    ipAddress: DataTypes.STRING,
    userAgent: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('success', 'error', 'warning'),
      defaultValue: 'success'
    },
    details: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'Log',
    tableName: 'logs',
    timestamps: true,
    updatedAt: false
  });
  return Log;
};

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NotificationConfig extends Model {
    static associate(models) {}
  }
  NotificationConfig.init({
    channel: {
      type: DataTypes.ENUM('telegram', 'email', 'sms'),
      allowNull: false
    },
    config: DataTypes.JSONB,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'NotificationConfig',
    tableName: 'notification_configs'
  });
  return NotificationConfig;
};

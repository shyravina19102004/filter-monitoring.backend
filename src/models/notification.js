'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Installation, { foreignKey: 'installationId', as: 'installation' });
      Notification.belongsTo(models.Rule, { foreignKey: 'ruleId', as: 'rule' });
      Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Notification.init({
    installationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ruleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: DataTypes.TEXT,
    severity: {
      type: DataTypes.ENUM('info', 'warning', 'critical'),
      defaultValue: 'warning'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications'
  });
  return Notification;
};

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rule extends Model {
    static associate(models) {
      Rule.belongsTo(models.FilterModel, { foreignKey: 'filterModelId', as: 'filterModel' });
      Rule.hasMany(models.Notification, { foreignKey: 'ruleId', as: 'notifications' });
    }
  }
  Rule.init({
    filterModelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    parameter: {
      type: DataTypes.ENUM('time', 'volume'),
      allowNull: false
    },
    threshold: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    unit: {
      type: DataTypes.ENUM('days', 'liters', 'hours'),
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM('warning', 'critical'),
      defaultValue: 'warning'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notificationChannels: {
      type: DataTypes.JSONB,
      defaultValue: ['interface']
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Rule',
    tableName: 'rules'
  });
  return Rule;
};

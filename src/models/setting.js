'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {}
  }
  Setting.init({
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    value: DataTypes.JSONB,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'settings'
  });
  return Setting;
};

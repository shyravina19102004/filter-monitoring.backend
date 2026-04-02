'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FilterModel extends Model {
    static associate(models) {
      FilterModel.belongsTo(models.FilterType, { foreignKey: 'filterTypeId', as: 'type' });
      FilterModel.belongsTo(models.Manufacturer, { foreignKey: 'manufacturerId', as: 'manufacturer' });
      FilterModel.hasMany(models.FilterInstance, { foreignKey: 'filterModelId', as: 'instances' });
      FilterModel.hasMany(models.Rule, { foreignKey: 'filterModelId', as: 'rules' });
    }
  }
  FilterModel.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    filterTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    manufacturerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lifeTimeDays: DataTypes.INTEGER,
    lifeVolume: DataTypes.INTEGER,
    minStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FilterModel',
    tableName: 'filter_models'
  });
  return FilterModel;
};

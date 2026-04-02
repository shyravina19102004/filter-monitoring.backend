'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FilterType extends Model {
    static associate(models) {
      FilterType.hasMany(models.FilterModel, { foreignKey: 'filterTypeId', as: 'filterModels' });
    }
  }
  FilterType.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FilterType',
    tableName: 'filter_types'
  });
  return FilterType;
};

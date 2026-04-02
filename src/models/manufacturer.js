'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Manufacturer extends Model {
    static associate(models) {
      Manufacturer.hasMany(models.FilterModel, { foreignKey: 'manufacturerId', as: 'filterModels' });
    }
  }
  Manufacturer.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    country: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Manufacturer',
    tableName: 'manufacturers'
  });
  return Manufacturer;
};

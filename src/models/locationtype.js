'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LocationType extends Model {
    static associate(models) {
      LocationType.hasMany(models.Location, { foreignKey: 'locationTypeId', as: 'locations' });
    }
  }
  LocationType.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'LocationType',
    tableName: 'location_types'
  });
  return LocationType;
};
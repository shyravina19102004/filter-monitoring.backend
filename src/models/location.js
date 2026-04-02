'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      Location.belongsTo(models.LocationType, { foreignKey: 'locationTypeId', as: 'type' });
      Location.belongsTo(models.Location, { foreignKey: 'parentId', as: 'parent' });
      Location.hasMany(models.Location, { foreignKey: 'parentId', as: 'children' });
      Location.hasMany(models.User, { foreignKey: 'locationId', as: 'users' });
      Location.hasMany(models.FilterHousing, { foreignKey: 'locationId', as: 'filterHousings' });
      Location.hasMany(models.Meter, { foreignKey: 'locationId', as: 'meters' });
    }
  }
  Location.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    locationTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'location_types',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id'
      }
    },
    description: DataTypes.TEXT,
    externalId: {
      type: DataTypes.STRING,
      comment: 'Идентификатор из внешней системы (ТОИР)'
    }
  }, {
    sequelize,
    modelName: 'Location',
    tableName: 'locations',
    indexes: [
      {
        fields: ['parentId']
      },
      {
        fields: ['locationTypeId']
      }
    ]
  });
  return Location;
};

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FilterHousing extends Model {
    static associate(models) {
      FilterHousing.belongsTo(models.Location, { foreignKey: 'locationId', as: 'location' });
      FilterHousing.hasMany(models.Installation, { foreignKey: 'housingId', as: 'installations' });
    }
  }
  FilterHousing.init({
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FilterHousing',
    tableName: 'filter_housings'
  });
  return FilterHousing;
};

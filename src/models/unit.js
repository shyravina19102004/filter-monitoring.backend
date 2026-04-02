'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Unit extends Model {
    static associate(models) {
      Unit.hasMany(models.Meter, { foreignKey: 'unitId', as: 'meters' });
    }
  }
  Unit.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    symbol: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Unit',
    tableName: 'units'
  });
  return Unit;
};

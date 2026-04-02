'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Meter extends Model {
    static associate(models) {
      Meter.belongsTo(models.Location, { foreignKey: 'locationId', as: 'location' });
      Meter.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
      Meter.hasMany(models.MeterReading, { foreignKey: 'meterId', as: 'readings' });
      Meter.hasMany(models.Installation, { foreignKey: 'meterId', as: 'installations' });
    }
  }
  Meter.init({
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('manual', 'auto'),
      defaultValue: 'manual'
    },
    lastValue: DataTypes.FLOAT,
    lastReadingDate: DataTypes.DATE,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Meter',
    tableName: 'meters'
  });
  return Meter;
};

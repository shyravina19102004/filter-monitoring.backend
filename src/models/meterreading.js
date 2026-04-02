'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MeterReading extends Model {
    static associate(models) {
      MeterReading.belongsTo(models.Meter, { foreignKey: 'meterId', as: 'meter' });
      MeterReading.belongsTo(models.User, { foreignKey: 'createdBy', as: 'user' });
    }
  }
  MeterReading.init({
    meterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'manual',
      allowNull: false
    },
    readingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'MeterReading',
    tableName: 'meter_readings'
  });
  return MeterReading;
};

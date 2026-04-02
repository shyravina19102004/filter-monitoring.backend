'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FilterInstance extends Model {
    static associate(models) {
      FilterInstance.belongsTo(models.FilterModel, { foreignKey: 'filterModelId', as: 'model' });
      FilterInstance.hasMany(models.Installation, { foreignKey: 'filterInstanceId', as: 'installations' });
    }
  }
  FilterInstance.init({
    filterModelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    serialNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('in_stock', 'installed', 'written_off'),
      defaultValue: 'in_stock',
      allowNull: false
    },
    purchaseDate: DataTypes.DATEONLY,
    installationDate: DataTypes.DATEONLY,
    warrantyEndDate: DataTypes.DATEONLY,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FilterInstance',
    tableName: 'filter_instances'
  });
  return FilterInstance;
};

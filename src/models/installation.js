'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Installation extends Model {
    static associate(models) {
      Installation.belongsTo(models.FilterHousing, { foreignKey: 'housingId', as: 'housing' });
      Installation.belongsTo(models.FilterInstance, { foreignKey: 'filterInstanceId', as: 'filterInstance' });
      Installation.belongsTo(models.Meter, { foreignKey: 'meterId', as: 'meter' });
      Installation.belongsTo(models.User, { foreignKey: 'installedBy', as: 'installer' });
      Installation.hasMany(models.Notification, { foreignKey: 'installationId', as: 'notifications' });
      Installation.hasMany(models.WorkOrder, { foreignKey: 'oldInstallationId', as: 'oldWorkOrders' });
      Installation.hasMany(models.WorkOrder, { foreignKey: 'newInstallationId', as: 'newWorkOrders' });
    }
  }
  Installation.init({
    housingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    filterInstanceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    installationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    removalDate: DataTypes.DATE,
    meterId: DataTypes.INTEGER,
    meterReadingAtInstall: DataTypes.FLOAT,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    installedBy: DataTypes.INTEGER,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Installation',
    tableName: 'installations'
  });
  return Installation;
};

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
      User.belongsTo(models.Location, { foreignKey: 'locationId', as: 'location' });
      User.hasMany(models.MeterReading, { foreignKey: 'createdBy', as: 'meterReadings' });
      User.hasMany(models.Installation, { foreignKey: 'installedBy', as: 'installations' });
      User.hasMany(models.WorkOrder, { foreignKey: 'performedBy', as: 'performedWorkOrders' });
      User.hasMany(models.WorkOrder, { foreignKey: 'approvedBy', as: 'approvedWorkOrders' });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    locationId: DataTypes.INTEGER,
    phone: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });
  return User;
};

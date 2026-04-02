'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkOrder extends Model {
    static associate(models) {
      WorkOrder.belongsTo(models.Installation, { foreignKey: 'oldInstallationId', as: 'oldInstallation' });
      WorkOrder.belongsTo(models.Installation, { foreignKey: 'newInstallationId', as: 'newInstallation' });
      WorkOrder.belongsTo(models.User, { foreignKey: 'performedBy', as: 'performer' });
      WorkOrder.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
      WorkOrder.hasMany(models.Attachment, { foreignKey: 'workOrderId', as: 'attachments' });
    }
  }
  WorkOrder.init({
    workDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    oldInstallationId: DataTypes.INTEGER,
    newInstallationId: DataTypes.INTEGER,
    workType: {
      type: DataTypes.ENUM('replacement', 'inspection', 'repair'),
      defaultValue: 'replacement'
    },
    performedBy: DataTypes.INTEGER,
    approvedBy: DataTypes.INTEGER,
    notes: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('draft', 'confirmed', 'cancelled'),
      defaultValue: 'draft'
    },
    pdfPath: DataTypes.STRING,
    // Добавленные поля для интеграции с ТОИР
    externalId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      comment: 'Идентификатор из внешней системы (ТОИР)'
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'manual',
      allowNull: false,
      comment: 'Источник создания: manual, toir'
    }
  }, {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_orders'
  });
  return WorkOrder;
};
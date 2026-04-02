'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    static associate(models) {
      Attachment.belongsTo(models.WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });
    }
  }
  Attachment.init({
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'work_orders',
        key: 'id'
      }
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Размер файла в байтах'
    }
  }, {
    sequelize,
    modelName: 'Attachment',
    tableName: 'attachments',
    timestamps: true,
    updatedAt: false,
  });
  return Attachment;
};
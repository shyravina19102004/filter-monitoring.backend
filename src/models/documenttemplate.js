'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentTemplate extends Model {
    static associate(models) {
    }
  }
  DocumentTemplate.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('label', 'work_order', 'report'),
      allowNull: false
    },
    content: DataTypes.TEXT,
    orientation: {
      type: DataTypes.ENUM('portrait', 'landscape'),
      defaultValue: 'portrait'
    },
    pageSize: {
      type: DataTypes.STRING,
      defaultValue: 'A4'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'DocumentTemplate',
    tableName: 'document_templates'
  });
  return DocumentTemplate;
};

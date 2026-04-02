'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsToMany(models.Role, {
        through: 'role_permissions',
        foreignKey: 'permissionId',
        otherKey: 'roleId',
        as: 'roles'
      });
    }
  }
  Permission.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions'
  });
  return Permission;
};
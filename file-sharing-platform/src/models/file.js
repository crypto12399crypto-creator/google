'use strict';
const { Model } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    static associate(models) {
      File.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
    }
  }
  File.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stored_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link_token: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    download_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_admin_file: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Premium Features
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'File',
    tableName: 'files',
    timestamps: true, // created_at is in the schema
    hooks: {
      beforeValidate: (file, options) => {
        if (!file.link_token) {
          file.link_token = crypto.randomBytes(12).toString('hex');
        }
      }
    }
  });
  return File;
};

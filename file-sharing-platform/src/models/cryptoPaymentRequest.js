'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CryptoPaymentRequest extends Model {
    static associate(models) {
      CryptoPaymentRequest.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      CryptoPaymentRequest.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
    }
  }
  CryptoPaymentRequest.init({
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
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plans',
        key: 'id',
      }
    },
    address: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    expected_amount_crypto: {
      type: DataTypes.DECIMAL(20, 8), // Suitable for most crypto values
      allowNull: false,
    },
    crypto_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'waiting_for_admin', 'confirmed', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'CryptoPaymentRequest',
    tableName: 'crypto_payment_requests',
    updatedAt: false // Schema only specifies created_at
  });
  return CryptoPaymentRequest;
};

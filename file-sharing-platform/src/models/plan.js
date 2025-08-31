'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Plan.hasMany(models.User, { foreignKey: 'subscription_plan_id', as: 'users' });
      Plan.hasMany(models.CryptoPaymentRequest, { foreignKey: 'plan_id', as: 'paymentRequests' });
    }
  }
  Plan.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price_usd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    duration_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    storage_limit: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    features: {
      type: DataTypes.TEXT,
      // Storing features as a JSON string is a good practice
      get() {
        const rawValue = this.getDataValue('features');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('features', JSON.stringify(value));
      }
    }
  }, {
    sequelize,
    modelName: 'Plan',
    tableName: 'plans',
    timestamps: false // The plan didn't specify timestamps for this table
  });
  return Plan;
};

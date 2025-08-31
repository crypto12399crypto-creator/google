const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 30],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 100], // Min 8 chars for password
      },
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    email_verification_token: {
        type: DataTypes.STRING,
    },
    password_reset_token: {
        type: DataTypes.STRING,
    },
    password_reset_expires: {
        type: DataTypes.DATE,
    },
    subscription_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subscription_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_storage: {
      type: DataTypes.BIGINT,
      defaultValue: 5 * 1024 * 1024 * 1024, // Default 5GB for free users
    },
    used_storage: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    tableName: 'users'
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};

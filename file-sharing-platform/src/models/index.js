'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

let sequelize;

// For this project, we are using SQLite.
// A more complex setup would use a config.json file for different environments.
const storage = process.env.DB_STORAGE || 'database.sqlite';
sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storage,
  logging: env === 'development' ? console.log : false, // Log queries in development
});


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// --- Define Associations ---
// We will define associations here once all models are created.
// This is a placeholder. The actual associations will be defined in each model file
// and called by the loop above.

module.exports = db;

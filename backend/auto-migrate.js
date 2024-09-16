const fs = require('fs');
const { sequelize, ...models } = require('./models');

async function autoMigrate() {
  try {
    // Apply associations
    Object.values(models)
      .filter(model => typeof model.associate === 'function')
      .forEach(model => model.associate(models));

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database schema updated successfully');
  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    await sequelize.close();
  }
}

autoMigrate();

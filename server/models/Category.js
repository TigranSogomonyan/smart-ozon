'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: false, defaultValue: '#FF6B35' },
  }, {
    tableName: 'categories',
    underscored: true,
    timestamps: false,
  });

  Category.associate = (models) => {
    Category.hasMany(models.Product, { foreignKey: 'category_id' });
  };

  return Category;
};

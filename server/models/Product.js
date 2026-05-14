'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false },
    category_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    photo_url: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    weight: { type: DataTypes.INTEGER },
  }, {
    tableName: 'products',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Shop, { foreignKey: 'shop_id', as: 'shop' });
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Product.hasMany(models.CartItem, { foreignKey: 'product_id' });
    Product.hasMany(models.Favorite, { foreignKey: 'product_id' });
    Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
  };

  return Product;
};

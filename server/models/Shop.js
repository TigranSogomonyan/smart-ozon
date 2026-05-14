'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    logo_url: { type: DataTypes.STRING },
  }, {
    tableName: 'shops',
    underscored: true,
    timestamps: false,
  });

  Shop.associate = (models) => {
    Shop.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
    Shop.hasMany(models.Product, { foreignKey: 'shop_id', as: 'products' });
  };

  return Shop;
};

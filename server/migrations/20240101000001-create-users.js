'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      birth_date: { type: Sequelize.DATEONLY },
      gender: { type: Sequelize.ENUM('male', 'female', 'other') },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('user', 'seller', 'admin'), defaultValue: 'user' },
      seller_request: {
        type: Sequelize.ENUM('none', 'pending', 'approved', 'rejected'),
        defaultValue: 'none',
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_gender" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_seller_request" CASCADE');
  },
};

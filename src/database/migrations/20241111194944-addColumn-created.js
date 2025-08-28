'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categories', 'created_at')
  }
}

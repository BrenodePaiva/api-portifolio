'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categories', 'updated_at')
  }
}

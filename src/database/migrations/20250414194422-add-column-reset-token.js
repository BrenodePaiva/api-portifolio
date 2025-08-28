'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'pass_reset_token', {
      type: Sequelize.STRING,
      allowNull: true
    })

    await queryInterface.addColumn('users', 'pass_reset_token_expires', {
      type: Sequelize.DATE,
      allowNull: true
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'pass_reset_token')
    await queryInterface.removeColumn('users', 'pass_reset_token_expires')
  }
}

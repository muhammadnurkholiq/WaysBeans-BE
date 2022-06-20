"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    // user
    await queryInterface.bulkInsert("users", [
      {
        name: "admin",
        email: "admin@admin.com",
        password:
          "$2b$10$Kc7OnOWR4Yb7AlbbRGEei.CmhuQAUcTNAgFuQCGp73YmZhfee.8pu",
        status: "admin",
      },
      {
        name: "user1",
        email: "user1@gmail.com",
        password:
          "$2b$10$Kc7OnOWR4Yb7AlbbRGEei.CmhuQAUcTNAgFuQCGp73YmZhfee.8pu",
        status: "customer",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};

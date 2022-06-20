"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // product model
      user.hasMany(models.product, {
        as: "products",
        foreignKey: {
          name: "idSeller",
        },
      });

      // user to cart
      user.hasMany(models.cart, {
        as: "cart",
        foreignKey: {
          name: "idBuyer",
        },
      });

      // transaction
      user.hasMany(models.transaction, {
        as: "buyer",
        foreignKey: {
          name: "idBuyer",
        },
      });

      // user chat
      user.hasMany(models.chat, {
        as: "senderMessage",
        foreignKey: {
          name: "idSender",
        },
      });

      user.hasMany(models.chat, {
        as: "recipientMessage",
        foreignKey: {
          name: "idRecipient",
        },
      });
    }
  }
  user.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      image: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user",
    }
  );
  return user;
};

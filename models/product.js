"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // product to user
      product.belongsTo(models.user, {
        as: "seller",
        foreignKey: {
          name: "idSeller",
        },
      });

      // product to cart
      product.hasMany(models.cart, {
        as: "cart",
        foreignKey: {
          name: "idProduct",
        },
      });

      // transaction detail
      product.hasMany(models.transaction, {
        as: "transaction",
        foreignKey: {
          name: "idProduct",
        },
      });
    }
  }
  product.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      price: DataTypes.INTEGER,
      desc: DataTypes.TEXT,
      stock: DataTypes.INTEGER,
      idSeller: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "product",
    }
  );
  return product;
};

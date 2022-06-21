// import models
const { cart, product, user, transactionDetail } = require("../../models");

// get all cart
exports.getCarts = async (req, res) => {
  try {
    // get id user
    const id = req.user.id;

    let dataCart = await cart.findAll({
      where: { idBuyer: id },
      include: {
        model: product,
        as: "product",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!dataCart) {
      return res.send({
        status: "Success",
        message: "Data cart not found",
        data: dataCart,
      });
    }

    dataCart = JSON.parse(JSON.stringify(dataCart));

    dataCart = dataCart.map((item) => {
      return {
        qty: item.qty,
        product: {
          ...item.product,
          image: process.env.PATH_FILE + item.product.image,
        },
      };
    });

    res.status(200).send({
      status: "Success",
      message: "Data cart found",
      data: dataCart,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// get cart
exports.getCart = async (req, res) => {
  try {
    // get id user
    const idUser = req.user.id;

    // get id from params
    const { id } = req.params;

    let dataCart = await cart.findOne({
      where: { idBuyer: idUser, idProduct: id },
      include: [
        {
          model: product,
          as: "product",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: user,
          as: "buyer",
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "password",
              "image",
              "phone",
              "address",
            ],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idProduct", "idBuyer"],
      },
    });

    if (!dataCart) {
      return res.send({
        status: "Success",
        message: "Data cart not found",
        data: dataCart,
      });
    }

    dataCart = JSON.parse(JSON.stringify(dataCart));

    dataCart = {
      ...dataCart,
      product: {
        ...dataCart.product,
        image: process.env.PATH_FILE + dataCart.product.image,
      },
      buyer: {
        ...dataCart.buyer,
      },
    };

    res.status(200).send({
      status: "Success",
      message: "Data cart found",
      data: dataCart,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// add cart
exports.addCart = async (req, res) => {
  try {
    // get id user
    const idUser = req.user.id;
    // get id params
    const { id } = req.params;

    // create cart
    const newCart = await cart.create({
      qty: 1,
      idProduct: id,
      idBuyer: idUser,
    });

    // get cart
    let cartExist = await cart.findOne({
      where: {
        id: newCart.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    cartExist = JSON.parse(JSON.stringify(cartExist));

    // response
    res.status(200).send({
      status: "Success",
      message: "Product has been added to your cart",
      data: cartExist,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// update cart
exports.updateCart = async (req, res) => {
  try {
    // get id user
    const idUser = req.user.id;
    // get id params
    const { id } = req.params;

    // get data
    const data = req.body;

    // update cart
    await cart.update(data, {
      where: {
        idProduct: id,
        idBuyer: idUser,
      },
    });

    let dataCart = await cart.findAll({
      where: { idBuyer: idUser },
      include: {
        model: product,
        as: "product",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },

      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!dataCart) {
      return res.send({
        status: "Success",
        message: "Data cart not found",
        data: dataCart,
      });
    }

    dataCart = JSON.parse(JSON.stringify(dataCart));

    dataCart = dataCart.map((item) => {
      return {
        qty: item.qty,
        idBuyer: item.idBuyer,
        product: {
          ...item.product,
          image: process.env.PATH_FILE + item.product.image,
        },
      };
    });

    // response
    res.status(200).send({
      status: "Success",
      message: "Product cart updated successfully",
      data: dataCart,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// delete cart
exports.deleteCart = async (req, res) => {
  try {
    // get id user
    const idUser = req.user.id;
    const id = req.params;

    const cartExist = await cart.findOne({
      idProduct: id,
      idBuyer: idUser,
    });

    // delete cart
    await cart.destroy({
      where: {
        idProduct: cartExist.idProduct,
      },
    });

    // response
    res.status(200).send({
      status: "Success",
      message: "Product has been removed from your cart",
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

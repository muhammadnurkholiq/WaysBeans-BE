// models
const { product, user } = require("../../models");

// import joi
const Joi = require("joi");

// import cloudinary
const cloudinary = require("../utils/Cloudinary");

// get all product
exports.getProducts = async (req, res) => {
  try {
    // check data product
    let productExist = await product.findAll({
      include: {
        model: user,
        as: "seller",
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
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    // check data exist
    if (!productExist) {
      return res.send({
        status: "Success",
        message: "Product data not found",
      });
    }

    productExist = JSON.parse(JSON.stringify(productExist));

    productExist = productExist.map((item) => {
      return {
        ...item,
        image: process.env.PATH_FILE + item.image,
      };
    });

    // response
    res.send({
      status: "Success",
      message: "Product data found",
      data: productExist,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// get product
exports.getProduct = async (req, res) => {
  try {
    // get id user
    const { id } = req.params;

    // check data product
    let productExist = await product.findOne({
      where: {
        id,
      },
      include: {
        model: user,
        as: "seller",
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
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    // check data exist
    if (!productExist) {
      return res.send({
        status: "Success",
        message: "Product data not found",
      });
    }

    productExist = JSON.parse(JSON.stringify(productExist));

    productExist = {
      ...productExist,
      image: process.env.PATH_FILE + productExist.image,
    };

    // response
    res.send({
      status: "Success",
      message: "Product data found",
      data: productExist,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// add product
exports.addProduct = async (req, res) => {
  try {
    // get id user
    const id = req.user.id;
    // get data
    const data = req.body;

    if (!req.file) {
      return res.send({
        status: "Failed",
        message: "Please select a product image",
      });
    }

    // validate data
    const schema = Joi.object({
      name: Joi.string().required(),
      price: Joi.number().required(),
      desc: Joi.string().required(),
      stock: Joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return res.send({
        status: "Failed",
        message: error.details[0].message,
      });
    }

    // cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "WaysBeans/Product",
      use_filename: true,
      unique_filename: false,
    });

    // create data product
    const newProduct = await product.create({
      ...data,
      image: result.public_id,
      idSeller: id,
    });

    // check data exist
    let productExist = await product.findOne({
      where: {
        id: newProduct.id,
      },
      include: {
        model: user,
        as: "seller",
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
      attributes: {
        exclude: ["createdAt", "updatedAt", "idSeller"],
      },
    });

    productExist = JSON.parse(JSON.stringify(productExist));

    // response
    res.status(200).send({
      status: "Success",
      message: "Product created successfully",
      data: {
        ...productExist,
        image: process.env.PATH_FILE + productExist.image,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// update product
exports.updateProduct = async (req, res) => {
  try {
    // get id params
    const { id } = req.params;
    // get data
    const data1 = req.body;

    const data2 = {
      name: req.body.name,
      price: req.body.price,
      desc: req.body.desc,
      stock: req.body.qty,
    };

    if (req.file) {
      // get data before update
      const beforeUpdate = await product.findOne({
        where: {
          id,
        },
      });

      // delete file to cloudinary
      cloudinary.uploader.destroy(beforeUpdate.image);

      // upload file to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "WaysBeans/Product",
        use_filename: true,
        unique_filename: false,
      });

      // update product
      await product.update(
        { ...data1, image: result.public_id },
        {
          where: {
            id,
          },
        }
      );
    } else {
      // update product
      await product.update(data2, {
        where: {
          id,
        },
      });
    }

    // check data exist
    let productExist = await product.findOne({
      where: {
        id,
      },
      include: {
        model: user,
        as: "seller",
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
      attributes: {
        exclude: ["createdAt", "updatedAt", "idSeller"],
      },
    });

    productExist = JSON.parse(JSON.stringify(productExist));

    // response
    res.status(200).send({
      status: "Success",
      message: "Product updated successfully",
      data: {
        ...productExist,
        image: process.env.PATH_FILE + productExist.image,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// delete product
exports.deleteProduct = async (req, res) => {
  try {
    // get id params
    const { id } = req.params;

    // check data exist
    const productExist = await product.findOne({
      where: {
        id,
      },
    });

    // delete file to cloudinary
    cloudinary.uploader.destroy(productExist.image);

    // delete data
    await product.destroy({
      where: {
        id,
      },
    });

    // response
    res.status(200).send({
      status: "Success",
      message: "Product data deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

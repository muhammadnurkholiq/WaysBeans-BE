// models
const { user } = require("../../models");

// import joi
const Joi = require("joi");

// import bcrypt
const bcrypt = require("bcrypt");

// import jwt
const jwt = require("jsonwebtoken");

// register
exports.register = async (req, res) => {
  try {
    // get data
    const data = req.body;

    // validate data
    const schema = Joi.object({
      name: Joi.string().min(4).required(),
      email: Joi.string().email().min(4).required(),
      password: Joi.string().min(5).required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return res.send({
        status: "Failed",
        message: error.details[0].message,
      });
    }

    // check data exist
    const userExist = await user.findOne({
      where: {
        email: data.email,
      },
    });

    if (userExist) {
      return res.send({
        status: "Failed",
        message: "Email has been registered",
      });
    }

    // hased password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // create data user
    const newUser = await user.create({
      ...data,
      password: hashedPassword,
      status: "customer",
    });

    // response
    res.status(200).send({
      status: "Success",
      message: "Account registration successful",
      data: newUser,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

// login
exports.login = async (req, res) => {
  try {
    // get data
    const data = req.body;

    // validate data
    const schema = Joi.object({
      email: Joi.string().email().min(4).required(),
      password: Joi.string().min(5).required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return res.send({
        status: "failed",
        message: error.details[0].message,
      });
    }

    // check user exist
    const userExist = await user.findOne({
      where: {
        email: data.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!userExist) {
      return res.send({
        status: "Failed",
        message: "Invalid email or password",
      });
    }

    const userPassword = await bcrypt.compare(
      data.password,
      userExist.password
    );

    if (!userPassword) {
      return res.send({
        status: "Failed",
        message: "Invalid email or password",
      });
    }

    // create token
    const token = jwt.sign({ id: userExist.id }, process.env.TOKEN_KEY);

    // response
    res.status(200).send({
      status: "Success",
      message: "Login successful",
      data: {
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        status: userExist.status,
        token,
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

// check auth
exports.checkAuth = async (req, res) => {
  try {
    // get data
    const id = req.user.id;

    // check user exist
    const userExist = await user.findOne({
      where: {
        id,
      },
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
    });

    if (!userExist) {
      return res.status(404).send({
        status: "failed",
        message: "User not found",
      });
    }

    // response
    res.status(200).send({
      status: "Success",
      message: "User found",
      data: userExist,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
    console.log(error);
  }
};

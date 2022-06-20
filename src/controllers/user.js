// models
const { user } = require("../../models");

// import cloudinary
const cloudinary = require("../utils/Cloudinary");

// get users
exports.getUsers = async (req, res) => {
  try {
    // get data exist
    let dataExist = await user.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "password", "phone", "address"],
      },
    });

    // check data exist
    if (!dataExist) {
      return res.send({
        status: "Failed",
        message: "Data user not found",
      });
    }

    dataExist = JSON.parse(JSON.stringify(dataExist));

    dataExist = dataExist.map((item) => {
      return {
        ...item,
        image: process.env.PATH_FILE + item.image,
      };
    });

    // response
    res.status(200).send({
      status: "Success",
      message: "Data user found",
      data: dataExist,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
  }
};

// get user
exports.getUser = async (req, res) => {
  try {
    // get id user
    const id = req.user.id;

    // get data exist
    let dataExist = await user.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    // check data exist
    if (!dataExist) {
      return res.send({
        status: "Failed",
        message: "Data user not found",
      });
    }

    dataExist = JSON.parse(JSON.stringify(dataExist));

    dataExist = {
      ...dataExist,
      image: process.env.PATH_FILE + dataExist.image,
    };

    // response
    res.status(200).send({
      status: "Success",
      message: "Data user found",
      data: dataExist,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    // get id user
    const id = req.user.id;

    // get data
    const data1 = req.body;
    const data2 = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
    };

    // update user
    if (req.file) {
      // get data before update
      const beforeUpdate = await user.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      });

      if (beforeUpdate.image !== null) {
        // delete file to cloudinary
        cloudinary.uploader.destroy(beforeUpdate.image);
      }

      // upload file to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "WaysBeans/Profile",
        use_filename: true,
        unique_filename: false,
      });

      // update user
      await user.update(
        {
          ...data1,
          image: result.public_id,
        },
        {
          where: {
            id,
          },
        }
      );
    } else {
      // update user
      await user.update(data2, {
        where: {
          id,
        },
      });
    }

    // get data exist
    let dataExist = await user.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    dataExist = JSON.parse(JSON.stringify(dataExist));

    dataExist = {
      ...dataExist,
      image: process.env.PATH_FILE + dataExist.image,
    };

    // response
    res.status(200).send({
      status: "Success",
      message: "User data updated successfully",
      data: dataExist,
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    // get id user
    const id = req.user.id;

    // check data exist
    const dataExist = await user.findOne({
      where: {
        id,
      },
    });

    // delete file to cloudinary
    cloudinary.uploader.destroy(dataExist.image);

    // delete user
    await user.destroy({
      where: {
        id,
      },
    });

    // response
    res.status(200).send({
      status: "Success",
      message: "User data deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Server error",
    });
  }
};

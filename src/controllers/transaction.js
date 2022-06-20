// import models
const { transaction, user, cart, product } = require("../../models");

// import midtrans
const midtransClient = require("midtrans-client");

// get transaction
exports.getTransactions = async (req, res) => {
  try {
    // get data transaction
    let data = await transaction.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: product,
          as: "product",
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "desc",
              "price",
              "stock",
              "idSeller",
            ],
          },
        },
        {
          model: user,
          as: "buyer",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "image"],
          },
        },
      ],
      attributes: {
        exclude: ["updatedAt", "idProduct", "idBuyer"],
      },
    });

    data = JSON.parse(JSON.stringify(data));

    data = data.map((item) => {
      return {
        ...item,
        product: {
          ...item.product,
          image: process.env.PATH_FILE + item.product.image,
        },
      };
    });

    res.status(200).send({
      status: "Success",
      message: "Data transaction found",
      data: data,
    });
  } catch (error) {
    res.send({
      status: "Failed",
      message: "Server Error",
    });
    console.log(error);
  }
};

// get transaction
exports.getTransaction = async (req, res) => {
  try {
    // get id user
    const id = req.user.id;

    // get data transaction
    let data = await transaction.findAll({
      where: {
        idBuyer: id,
      },
      order: [["createdAt", "DESC"]],
      include: {
        model: product,
        as: "product",
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "desc",
            "price",
            "stock",
            "idSeller",
          ],
        },
      },
      attributes: {
        exclude: ["updatedAt"],
      },
    });

    data = JSON.parse(JSON.stringify(data));

    data = data.map((item) => {
      return {
        ...item,
        product: {
          ...item.product,
          image: process.env.PATH_FILE + item.product.image,
        },
      };
    });

    res.status(200).send({
      status: "Success",
      message: "Data transaction found",
      data: data,
    });
  } catch (error) {
    res.send({
      status: "Failed",
      message: "Server Error",
    });
    console.log(error);
  }
};

// add transaction
exports.addTransaction = async (req, res) => {
  try {
    // get id user
    const id = req.user.id;
    // get data

    let data = JSON.parse(JSON.stringify(req.body));
    let idPayment = parseInt(
      data[0].idProduct + Math.random().toString().slice(3, 8)
    );
    data = data.map((item) => {
      return {
        idPayment: idPayment,
        idBuyer: id,
        ...item,
        status: "Waiting Approve",
      };
    });

    let newTransaction = await transaction.bulkCreate(data);

    // Get buyer data here ...
    const buyerData = await user.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    // Create Snap API instance here ...
    let snap = new midtransClient.Snap({
      // Set to true if you want Production Environment (accept real transaction).
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    let parameter = {
      transaction_details: {
        order_id: newTransaction[0].idPayment,
        gross_amount: newTransaction[0].totalPrice,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        full_name: buyerData.name,
        email: buyerData.email,
        phone: buyerData.phone,
      },
    };

    // Create trasaction token & redirect_url with snap variable here ...
    const payment = await snap.createTransaction(parameter);

    // delete cart
    await cart.destroy({
      where: {
        idBuyer: id,
      },
    });
    res.send({
      status: "pending",
      message: "Pending transaction payment gateway",
      payment,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

// update transaction
exports.updateTransaction = async (req, res) => {
  try {
    // get id params
    const { id } = req.params;

    // get data
    const data = {
      status: req.body.status,
    };

    // update transaction
    await transaction.update(data, {
      where: {
        id,
      },
    });

    // get data transaction
    const dataExist = await transaction.findOne({
      where: {
        id,
      },
    });

    res.status(200).send({
      status: "Success",
      message: "Transaction updated successfully",
      data: dataExist,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

// Create configurate midtrans client with CoreApi
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

const core = new midtransClient.CoreApi();

core.apiConfig.set({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});
console.log(core.transaction.notification);

/**
 *  Handle update transaction status after notification
 * from midtrans webhook
 * @param {string} status
 * @param {transactionId} transactionId
 */

// notification
exports.notification = async (req, res) => {
  try {
    const statusResponse = await core.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        // TODO set transaction status on your database to 'challenge'
        // and response with 200 OK
        handleTransaction("pending", orderId);
        res.status(200);
      } else if (fraudStatus == "accept") {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        updateProduct(orderId);
        handleTransaction("success", orderId);
        res.status(200);
      }
    } else if (transactionStatus == "settlement") {
      // TODO set transaction status on your database to 'success'
      // and response with 200 OK
      updateProduct(orderId);
      handleTransaction("success", orderId);
      res.status(200);
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      // TODO set transaction status on your database to 'failure'
      // and response with 200 OK
      handleTransaction("failed", orderId);
      res.status(200);
    } else if (transactionStatus == "pending") {
      // TODO set transaction status on your database to 'pending' / waiting payment
      // and response with 200 OK
      handleTransaction("pending", orderId);
      res.status(200);
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

// handle transaction
const handleTransaction = async (status, transactionId) => {
  await transaction.update(
    {
      status,
    },
    {
      where: {
        id: transactionId,
      },
    }
  );
};

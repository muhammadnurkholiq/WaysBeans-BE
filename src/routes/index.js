// express
const express = require("express");

const router = express.Router();

// middlewares
const { auth } = require("../middlewares/auth");
const { uploadFile } = require("../middlewares/uploadFile");

// controllers
// auth
const { register, login, checkAuth } = require("../controllers/auth");

// user
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/user");

// product
const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

// cart
const {
  getCarts,
  getCart,
  addCart,
  updateCart,
  deleteCart,
} = require("../controllers/cart");

// transaction
const {
  getTransactions,
  getTransaction,
  addTransaction,
  updateTransaction,
} = require("../controllers/transaction");

// route
// auth
router.post("/register", register);
router.post("/login", login);
router.get("/check-auth", auth, checkAuth);

// user
router.get("/users", auth, getUsers);
router.get("/user", auth, getUser);
router.patch("/user", auth, uploadFile("image"), updateUser);
router.delete("/user", auth, deleteUser);

// product
router.get("/products", getProducts);
router.get("/product/:id", getProduct);
router.post("/product", auth, uploadFile("image"), addProduct);
router.patch("/product/:id", auth, uploadFile("image"), updateProduct);
router.delete("/product/:id", auth, deleteProduct);

// cart
router.get("/carts", auth, getCarts);
router.get("/cart/:id", auth, getCart);
router.post("/cart/:id", auth, addCart);
router.patch("/cart/:id", auth, updateCart);
router.delete("/cart/:id", auth, deleteCart);

// transaction
router.get("/transactions", auth, getTransactions);
router.get("/transaction", auth, getTransaction);
router.post("/transaction", auth, addTransaction);
router.patch("/transaction/:id", auth, updateTransaction);

module.exports = router;

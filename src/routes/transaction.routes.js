const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controller/transaction.controller");

const router = express.Router();
router.post(
  "/",
  authMiddleware.authMiddleware,
  transactionController.createTransaction,
);
//api for initial funds
router.post("/system/initial-funds",authMiddleware.authSystemUserMiddleWare,transactionController.createIntialFunds);

module.exports = router;

const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controller/account.controller");
const router = express.Router();
//protected route with create account
router.post(
  "/",
  authMiddleware.authMiddleware,
  accountController.createAccount,
);
module.exports = router;

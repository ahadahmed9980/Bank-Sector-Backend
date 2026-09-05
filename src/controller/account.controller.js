const accountModel = require("../models/account.model");

async function createAccount(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: User not found in request",
      });
    }

    const { currency } = req.body;
    const isExist = await accountModel.findOne({ user: req.user._id });
    if (isExist) {
      return res.status(409).json({
        message: "User already has an account",
        // account: existingAccount,
      });
    }

    const account = await accountModel.create({
      user: req.user._id,
      currency: currency || "PKR",
    });

    return res.status(201).json({
      message: "account created successfully",
      userAccount: account,
    });
  } catch (err) {
    console.log("error in account controller", err);
    return res.status(500).json({
      message: "internal server error",
      error: err.message,
    });
  }
}

module.exports = { createAccount };

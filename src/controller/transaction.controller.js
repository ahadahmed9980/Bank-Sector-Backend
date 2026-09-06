const transactionModel = require("../models/transaction.model");
const userModel = require("../models/user.model");
const ledgerModel = require("../models/leager.model");
const accountModel = require("../models/account.model");
async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotanceKey } = req.body;
  //validate request
  if (!fromAccount || !toAccount || !amount || idempotanceKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount, idempotanceKey are required",
    });
  }
  const senderAccount = await accountModel.findOne({
    _id: fromAccount,
  });
  const reciverAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!senderAccount || !reciverAccount) {
    return res.status(400).json({
      message: "invald sender or reciver account",
    });
  }
}

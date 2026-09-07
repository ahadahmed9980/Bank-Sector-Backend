const transactionModel = require("../models/transaction.model");
const mongoose = require("mongoose");
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
  //validate idempotancy key
  const isTransactionalreadyExist = await transactionModel.findOne({
    idempotanceKey: idempotanceKey,
  });
  if (isTransactionalreadyExist) {
    if (isTransactionalreadyExist.status === "COMPLETED") {
      return res.status(200).json({
        message: "transaction completed",
        transaction: isTransactionalreadyExist,
      });
    }
    if (isTransactionalreadyExist.status === "PENDING") {
      return res.status(200).json({
        message: "transaction is in processing",
      });
    }
    if (isTransactionalreadyExist.status === "FAILED") {
      return res.status(500).json({
        message: "transaction Failed Please try again",
      });
    }
    if (isTransactionalreadyExist.status === "REVERSED") {
      return res.status(500).json({
        message: "transaction reverse please retry",
      });
    }
  }
  //check acc status
  if (senderAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "your account is not Active Contact support",
    });
  }
  if (reciverAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "Receiver account is not active",
    });
  }
  //checking sender balance from ledger
  const balance = await fromAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({
      message: `insufficient balance Current balance is,${balance}, requested amount is ${amount}`,
    });
  }
  //create transaction
  //is mai start transaction walal part mongo db hamen deta hai jis mai agar to saaray steps complete ho gaye
  //  to he db mai save ho ga agar aun mai say aik bhi comnplete na howa to koi bhi complete na ho or db mai save na ho
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await transactionModel.create(
    {
      senderAccount,
      reciverAccount,
      amount,
      idempotanceKey,
      status: "PENDING",
    },
    { session },
  );
}

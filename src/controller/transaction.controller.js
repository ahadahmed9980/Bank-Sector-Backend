const transactionModel = require("../models/transaction.model");
const mongoose = require("mongoose");
const {
  sendDebitAlert,
  sendCreditAlert,
} = require("../services/email.service");
const ledgerModel = require("../models/leager.model");
const accountModel = require("../models/account.model");
async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotanceKey } = req.body;
  //validate request
  if (!fromAccount || !toAccount || !amount || !idempotanceKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount, idempotanceKey are required",
    });
  }
  //amount validation
  if (amount <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than 0",
    });
  }
  //same account check
  if (fromAccount === toAccount) {
    return res.status(400).json({
      message: "Sender and receiver account cannot be same",
    });
  }
  if (
    !mongoose.Types.ObjectId.isValid(fromAccount) ||
    !mongoose.Types.ObjectId.isValid(toAccount)
  ) {
    return res.status(400).json({
      message: "Invalid sender or receiver account ID",
    });
  }
  try {
    const senderAccount = await accountModel.findOne({
      _id: fromAccount,
    });
    const reciverAccount = await accountModel
      .findOne({
        _id: toAccount,
      })
      .populate({
        path: "user",
        select: "+systemUser",
      });

    if (!senderAccount || !reciverAccount) {
      return res.status(400).json({
        message: "Invalid sender or receiver account",
      });
    }
    //can not transaffer amount to system user
    if (reciverAccount.user.systemUser) {
      return res.status(400).json({
        message: "System user cannot receive transactions",
      });
    }
    //validate idempotancy key
    const isTransactionalreadyExist = await transactionModel.findOne({
      idempotanceKey: idempotanceKey,
    });
    if (isTransactionalreadyExist) {
      if (isTransactionalreadyExist.status === "COMPLETED") {
        return res.status(200).json({
          message: "transaction  already completed make new transaction",
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
    const balance = await senderAccount.getBalance();
    if (balance < amount) {
      return res.status(400).json({
        message: `insufficient balance Current balance is,${balance}, requested amount is ${amount}`,
      });
    }
    //create transaction
    //is mai start transaction walal part mongo db hamen deta hai jis mai agar to saaray steps complete ho gaye
    //  to he db mai save ho ga agar aun mai say aik bhi comnplete na howa to koi bhi complete na ho or db mai save na ho
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      //creating transaction
      const transaction = (
        await transactionModel.create(
          [
            {
              fromAccount,
              toAccount,
              amount,
              idempotanceKey,
              status: "PENDING",
            },
          ],
          { session },
        )
      )[0];
      //creating document of debit ledger for sender account
      const debitledgerEntry = await ledgerModel.create(
        [
          {
            account: senderAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT",
          },
        ],
        {
          session,
        },
      );
  
      //creating document of credit ledger for reciver account
      const creditledgerEntry = await ledgerModel.create(
        [
          {
            account: reciverAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT",
          },
        ],
        {
          session,
        },
      );
      // transaction.status = "COMPLETED";
      // await transaction.save({ session });
      await transactionModel.findOneAndUpdate(
        {
          _id: transaction._id,
        },
        { status: "COMPLETED" },
        { session },
      );

      await session.commitTransaction();
      //sending email for debit alert
      //sending email for credit alert
      //  Promise.all([
      // 1. Sender ko Debit Email
      sendDebitAlert({
        senderEmail: req.user.email,
        senderName: req.user.name,
        amount: transaction.amount,
        transactionId: transaction._id.toString(),
        receiverName: reciverAccount.user.name,
      }).catch((err) => {
        console.log("Debit email failed:", err);
      });

      sendCreditAlert({
        receiverEmail: reciverAccount.user.email,
        receiverName: reciverAccount.user.name,
        amount: transaction.amount,
        transactionId: transaction._id.toString(),
        senderName: req.user.name,
      }).catch((err) => {
        console.log("Credit email failed:", err);
      });

      return res.status(201).json({
        message: "Transaction completed successfully",
        transaction,
      });
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      return res.status(400).json({
        message: "transaction is pending in system we will deliver it soon",
      });
    } finally {
      await session.endSession();
    }
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return res.status(500).json({
      message: "error while doing transaction",
    });
  }
}
//intial funds transffer account
async function createIntialFunds(req, res) {
  const { toAccount, amount, idempotanceKey } = req.body;
  //validate request
  if (!toAccount || !amount || !idempotanceKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount, idempotanceKey are required",
    });
  }
  if (amount <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than 0",
    });
  }
  const reciverAccount = await accountModel
    .findOne({
      _id: toAccount,
    })
    .populate("user");
  if (!reciverAccount) {
    return res.status(400).json({
      message: "invald sender or reciver account",
    });
  }
  //now system user account
  const systemUserAccount = await accountModel.findOne({
    user: req.user._id,
  });
  if (!systemUserAccount) {
    return res.status(400).json({
      message: "System User not found",
    });
  }
  const isTransactionalreadyExist = await transactionModel.findOne({
    idempotanceKey: idempotanceKey,
  });
  if (isTransactionalreadyExist) {
    if (isTransactionalreadyExist.status === "COMPLETED") {
      return res.status(200).json({
        message: "transaction is already  completed make new transaction",
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
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const transaction = new transactionModel({
      fromAccount: systemUserAccount._id,
      toAccount,
      amount,
      idempotanceKey,
      status: "PENDING",
    });
    //creating document of debit ledger for sender account
    const debitledgerEntry = await ledgerModel.create(
      [
        {
          account: systemUserAccount._id,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      {
        session,
      },
    );
    // await (() => {
    //   return new Promise((resolve) => setTimeout(resolve, 100 * 1000));
    // })();

    //creating document of credit ledger for reciver account
    const creditledgerEntry = await ledgerModel.create(
      [
        {
          account: reciverAccount._id,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      {
        session,
      },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return res.status(500).json({
      message: "error while doing transaction from system user",
    });
  } finally {
    await session.endSession();
  }
}

module.exports = { createTransaction, createIntialFunds };

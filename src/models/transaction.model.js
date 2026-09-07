const mongoose = require("mongoose");
const ledgerModel = require("../models/leager.model");
const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "Transaction must be accociate with a from account"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "Transaction must be accociate with a to account"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        message:
          'Status can be either "PENDING", "COMPLETED", "FAILED", "REVERSED"',
      },
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: [true, "amount is required for transaction"],
      min: [1, "Transaction amount cannot be negative"],
    },
    idempotanceKey: {
      type: String,
      required: [true, "key is required for transaction"],
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);
const transactionModel = mongoose.model("trasaction", transactionSchema);
module.exports = transactionModel;

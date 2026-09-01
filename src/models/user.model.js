const mongoose = require("mongoose");
const userSchema = mongoose.connect(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "kindly enter a valid email address",
      ],
      unique: [true, "email already register"],
    },
    name: {
      type: String,
      required: [true, "name is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
      match: [
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must be at least 6 characters and contain letters, numbers, and a special character",
      ],
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

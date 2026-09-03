const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sessionModel = require("../models/session.model");
const { sendEmail } = require("../services/email.service");
const { generateOtp, getOtpHtml } = require("../utils/otp");
const otpModel = require("../models/otpModel");
//reg user
async function userRegister(req, res) {
  const { name, email, password } = req.body;
  try {
    //checking
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required(name,email,password)",
      });
    }
    const isExist = await userModel.findOne({
      email,
    });
    if (isExist) {
      return res.status(409).json({
        message: "user already exist",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
    });
    //gen otp
    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const otpHash = await bcrypt.hash(otp, 10);
    await otpModel.create({
      email: user.email,
      user: user._id,
      otpHash: otpHash,
    });
    await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html);
    return res.status(201).json({
      message: "user created successfully",
      user: {
        id: user._id,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
//login api
async function userLogin(req, res) {
  const { name, email, password } = req.body;
}

//refreshToken
async function refreshToken(req, res) {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({
      message: "Refresh Token not found",
    });
  }
  try {
    //decoded
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      revoke: false,
    });
    //if no session found
    if (!session) {
      return res.status(401).json({
        message: "no session found ",
      });
    }
    const isMatch = session.verifyToken(incomingRefreshToken);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }
  } catch (err) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { userRegister };

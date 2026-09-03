const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sessionModel = require("../models/session.model");
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
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
  } catch (error) {
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

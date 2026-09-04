const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");

router.post("/register", authController.userRegister);
router.post("/login", authController.userLogin);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-otp", authController.resendOtp);
router.post("/refreshToken", authController.rotateRefreshToken);
module.exports = router;

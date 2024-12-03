const express = require("express");

const {
  registerController,
  loginController,
  verifyEmailController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  checkMeController,
  resendVerificationEmailController,
  resendResetPasswordLinkController,
} = require("../controllers/userController");
const { requireAuth } = require("../middlewares/requireAuth");

const userRoutes = express.Router();

userRoutes.get("/check-me", requireAuth, checkMeController);

userRoutes.post("/register", registerController);

userRoutes.post("/login", loginController);

userRoutes.get("/verify-email/:token", verifyEmailController);

userRoutes.get("/resend-verify-email", resendVerificationEmailController);

// userRoutes.post("/social-register", socialRegister);

// userRoutes.post("/social-login", socialLogin);

// userRoutes.patch("/update-password/:id", updatePassword);

// userRoutes.delete("/delete-account/:id", requireAuth, deleteAccount);

userRoutes.post("/forgot-password", forgotPasswordController);

userRoutes.post("/resend-forgot-password", resendResetPasswordLinkController);

userRoutes.post("/reset-password/:token", resetPasswordController);

userRoutes.get("/logout", requireAuth, logoutController);

// userRoutes.route("/authenticate").post(controller.verifyUser, (req, res) =>
//   res.end()
// );

module.exports = { userRoutes };

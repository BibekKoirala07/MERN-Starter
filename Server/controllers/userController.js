const UserModel = require("../models/userModel");
const createJsonWebToken = require("../utils/createJsonWebToken");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../utils/email");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const checkMeController = async (req, res, next) => {
  try {
    console.log("req.user", req.user);
    const user = await UserModel.findOne({ email: req.user.user.email });
    return res
      .status(200)
      .json({ success: true, message: "This is your account", user });
  } catch (error) {
    next(error);
  }
};

const registerController = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists and isn't verified
    const existingUserIsNotVerified = await UserModel.findOne({
      email,
      isVerified: false,
    });
    if (existingUserIsNotVerified) {
      const token = createJsonWebToken(existingUserIsNotVerified);
      const { password: hashedPassword, ...data } =
        existingUserIsNotVerified._doc;
      const expiryDate = new Date(Date.now() + 3600000);

      await sendVerificationEmail(
        email,
        existingUserIsNotVerified.verificationToken
      );

      return res
        .cookie("token", token, {
          secure: false,
          expires: expiryDate,
          httpOnly: true,
        })
        .status(200)
        .json({
          statusCode: 200,
          success: true,
          data,
          message: "Confirmation Email Sent",
        });
    }
    const user = await UserModel.registerStatics(username, email, password);

    const token = createJsonWebToken(user);

    const { password: hashedPassword, ...data } = user._doc;
    const expiryDate = new Date(Date.now() + 3600000);

    await sendVerificationEmail(email, user.verificationToken);

    return res
      .cookie("token", token, {
        secure: false,
        expires: expiryDate,
        httpOnly: true,
      })
      .status(200)
      .json({
        statusCode: 200,
        success: true,
        data,
        message: "Confirmation Email Sent",
      });
  } catch (error) {
    console.log("error:", error);
    next(error);
  }
};

const loginController = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.loginStatics(email, password);
    const { password: hashedPassword, ...data } = user._doc;
    const expiryDate = new Date(Date.now() + 3600000);
    if (user.isVerified) {
      const token = createJsonWebToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        expires: expiryDate,
      });

      setTimeout(() => {
        return res.status(200).json({
          statusCode: 200,
          success: true,
          data,
          message: "Logged In Successfully",
        });
      }, 2000);
    } else {
      setTimeout(() => {
        return res.status(200).json({
          success: false,
          statusCode: 200,
          message: "You are not verified. Register again",
        });
      }, 2000);
    }
  } catch (error) {
    setTimeout(() => {
      console.log("error:", error);
      next(error);
    }, 2000);
  }
};

const verifyEmailController = async (req, res, next) => {
  const { token } = req.params;
  console.log("req.user", req.user);
  console.log("token");

  try {
    // Find the user with the given verification token
    const user = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
      return sendErrorResponse(res, new Error("Invalid or expired token"), 400);
    }

    // Update user's verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    const expiryDate = new Date(Date.now() + 360000); // 1 hour

    const jsonToken = createJsonWebToken(user);

    // Send a success response
    return res
      .cookie("token", jsonToken, {
        secure: false,
        expires: expiryDate,
        httpOnly: true,
      })
      .status(200)
      .json({
        statusCode: 200,
        success: true,
        data: user,
        message: "Email verified successfully",
      });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmailController = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found or already verified",
      });
    }

    // Generate new verification token
    user.verificationToken = crypto.randomBytes(20).toString("hex");
    user.verificationTokenExpiresAt = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, user.verificationToken);

    return res.status(200).json({
      success: true,
      message: "New verification email sent",
    });
  } catch (error) {
    next(error);
  }
};

const logoutController = async (req, res) => {
  console.log("logout done");
  res.clearCookie("token");
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = await crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    console.log("token", resetToken);

    await sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword != confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const resendResetPasswordLinkController = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate a new reset password token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send new reset password email
    await sendResetPasswordEmail(user.email, resetToken);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkMeController,
  registerController,
  loginController,
  verifyEmailController,
  resendVerificationEmailController,
  forgotPasswordController,
  resendResetPasswordLinkController,
  resetPasswordController,
  logoutController,
};

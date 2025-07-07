import express, { Router, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import axios from "axios";
import { sendSuccess, sendError } from "../../utils/response";
import { AUTH_RESPONSE_MESSAGES } from "../../utils/responseMessages";

const authRoutes = (): Router => {
  const router = express.Router();

  router.use(cookieParser());

  // Request password reset
  router.post("/request-password-reset", async (req: any, res: any, next: NextFunction) => {
    try {
      const { email, phone } = req.body;
      if (!email && !phone) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.EMAIL_OR_PHONE_REQUIRED, 400);
      }

      const user = await req.app.get("models").User.findOne({
        where: {
          [Op.or]: [email ? { email } : null, phone ? { phone } : null].filter(Boolean),
        },
      });

      if (!user) return sendError(res, AUTH_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000);

      await req.app.get("models").PasswordResetToken.create({ userId: user.id, token, expiresAt });

      if (user.email) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await transporter.sendMail({
          to: user.email,
          subject: AUTH_RESPONSE_MESSAGES.RESET_EMAIL_SUBJECT,
          text: `${AUTH_RESPONSE_MESSAGES.RESET_EMAIL_TEXT} : ${resetUrl}`,
        });
      }

      sendSuccess(
        res,
        {
          message: AUTH_RESPONSE_MESSAGES.RESET_INSTRUCTIONS_SENT(user.email),
          email: user.email,
        },
        200
      );
    } catch (err: any) {
      next(err);
    }
  });

  // Reset password
  router.post("/reset-password", async (req: any, res: any, next: NextFunction) => {
    try {
      const { token, newPassword, email, phone } = req.body;

      if (token) {
        const resetToken = await req.app.get("models").PasswordResetToken.findOne({
          where: {
            token,
            expiresAt: { [Op.gt]: new Date() },
          },
        });
        if (!resetToken)
          return sendError(res, AUTH_RESPONSE_MESSAGES.INVALID_OR_EXPIRED_TOKEN, 400);

        const user = await req.app.get("models").User.findByPk(resetToken.userId);
        if (!user) return sendError(res, AUTH_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        await resetToken.destroy();

        return sendSuccess(res, { message: AUTH_RESPONSE_MESSAGES.PASSWORD_RESET }, 200);
      }

      if ((email || phone) && newPassword) {
        const user = await req.app.get("models").User.findOne({
          where: {
            [Op.or]: [email ? { email } : null, phone ? { phone } : null].filter(Boolean),
          },
        });
        if (!user) return sendError(res, AUTH_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return sendSuccess(res, { message: AUTH_RESPONSE_MESSAGES.PASSWORD_RESET }, 200);
      }

      return sendError(res, AUTH_RESPONSE_MESSAGES.INVALID_RESET_REQUEST, 400);
    } catch (err: any) {
      next(err);
    }
  });

  // User Registration
  router.post("/register", async (req: any, res: any, next: NextFunction) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gouvernorat,
        recoveryCode,
        packType, // <-- from frontend
      } = req.body;

      if ((!email || email.trim() === "") && (!recoveryCode || recoveryCode.trim() === "")) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.REGISTER_REQUIREMENTS, 400);
      }

      if (!packType) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.PACK_TYPE_REQUIRED, 400);
      }

      // Find the selected free pack
      const freePack = await req.app.get("models").Pack.findOne({
        where: { type: packType },
      });

      if (!freePack) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.PACK_TYPE_NOTFOUND, 400);
      }

      let emailVerificationCode = null;
      if (email) {
        emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await req.app.get("models").User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gouvernorat,
        recoveryCode: recoveryCode ? await bcrypt.hash(recoveryCode, 10) : null,
        emailVerificationCode: emailVerificationCode || null,
      });

      // Assign the selected free pack to the user in UserPack
      let durationMonths = 9;
      let startDate = new Date();
      let endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      await req.app.get("models").UserPack.create({
        userId: newUser.id,
        packId: freePack.id,
        durationMonths,
        price: 0,
        startDate,
        endDate,
        isActive: true,
      });

      if (email) {
        await axios.post(
          `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/send-verification-email`,
          { email },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      sendSuccess(res, { message: AUTH_RESPONSE_MESSAGES.USER_REGISTERED, user: newUser }, 200);
    } catch (err: any) {
      if (err.name === "SequelizeUniqueConstraintError" || (err.parent && err.parent.constraint)) {
        let column = err?.parent?.detail
          ? err?.parent?.detail
          : AUTH_RESPONSE_MESSAGES.UNIQUE_CONSTRAINT;
        return sendError(res, column, 400);
      }
      next(err);
    }
  });

  // User Login with Refresh Token
  router.post("/login", async (req: any, res: any, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await req.app.get("models").User.findOne({ where: { email } });
      if (!user) return sendError(res, AUTH_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return sendError(res, AUTH_RESPONSE_MESSAGES.INVALID_CREDENTIALS, 400);

      const accessToken = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET as any,
        { expiresIn: process.env.JWT_EXPIRES_IN as any }
      );
      const refreshToken = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_REFRESH_SECRET as any,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(
        res,
        {
          message: "Login successful!",
          token: accessToken,
          user: { id: user.id, role: user.role, phone: user.phone },
        },
        200
      );
    } catch (err: any) {
      next(err);
    }
  });

  // Refresh Token Endpoint
  router.post("/refresh-token", (req: any, res: any, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return sendError(res, AUTH_RESPONSE_MESSAGES.NO_REFRESH_TOKEN, 401);

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err: any, user: any) => {
        if (err) return sendError(res, AUTH_RESPONSE_MESSAGES.INVALID_REFRESH_TOKEN, 403);
        const accessToken = jwt.sign(
          { id: user.id, role: user.role, email: user.email },
          process.env.JWT_SECRET as any,
          { expiresIn: process.env.JWT_EXPIRES_IN as any }
        );
        sendSuccess(res, { token: accessToken }, 200);
      });
    } catch (err: any) {
      next(err);
    }
  });

  router.post("/verify-email", async (req: any, res: any, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.EMAIL_AND_CODE_REQUIRED, 400);
      }

      const user = await req.app.get("models").User.findOne({ where: { email } });
      if (!user) return sendError(res, AUTH_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);

      if (user.isEmailVerified) {
        return sendSuccess(
          res,
          { success: true, message: AUTH_RESPONSE_MESSAGES.ALREADY_VERIFIED },
          200
        );
      }

      if (user.emailVerificationCode !== code) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, 400);
      }

      user.isEmailVerified = true;
      user.emailVerificationCode = null;
      await user.save();

      return sendSuccess(res, { message: AUTH_RESPONSE_MESSAGES.EMAIL_VERIFIED }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  router.post("/send-verification-email", async (req: any, res: any, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await req.app.get("models").User.findOne({ where: { email } });
      if (!user) return sendError(res, AUTH_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);

      const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailVerificationCode = emailVerificationCode;
      user.isEmailVerified = false;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const code = emailVerificationCode;

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const link = `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}&code=${code}`;

      await transporter.sendMail({
        to: email,
        subject: AUTH_RESPONSE_MESSAGES.VERIFY_EMAIL_SUBJECT,
        text: `Your verification code is: ${code}\nOr click this link to verify: ${link}`,
        html: `<p>Your verification code is: <b>${code}</b></p><p>Or <a href="${link}">click here to verify your email</a>.</p>`,
      });

      sendSuccess(res, { message: AUTH_RESPONSE_MESSAGES.VERIFICATION_EMAIL_SENT }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  router.post("/verify-recovery-code", async (req: any, res: any, next: NextFunction) => {
    try {
      const { email, phone, recoveryCode } = req.body;
      if ((!email && !phone) || !recoveryCode) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.EMAIL_OR_PHONE_AND_CODE_REQUIRED, 400);
      }

      const user = await req.app.get("models").User.findOne({
        where: {
          [Op.or]: [email ? { email } : null, phone ? { phone } : null].filter(Boolean),
        },
      });

      if (!user) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);
      }

      const isMatch = await bcrypt.compare(recoveryCode, user.recoveryCode || "");
      if (!isMatch) {
        return sendError(res, AUTH_RESPONSE_MESSAGES.INVALID_RECOVERY_CODE, 400);
      }

      return sendSuccess(res, { message: AUTH_RESPONSE_MESSAGES.RECOVERY_CODE_VALID }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  return router;
};

export default authRoutes;

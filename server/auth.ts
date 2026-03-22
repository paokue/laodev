import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  generateResetToken,
} from "../lib/auth.server";
import { generateOtp, sendOtpEmail, sendResetPasswordEmail } from "../lib/mailer";

export const authRouter = Router();

// Step 1: Register - creates user with emailVerified=false, sends OTP
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser && !existingUser.emailVerified) {
      // Update existing unverified user
      await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role: role === "DEVELOPER" ? "DEVELOPER" : "USER",
          otpCode: otp,
          otpExpiry,
        },
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role === "DEVELOPER" ? "DEVELOPER" : "USER",
          emailVerified: false,
          otpCode: otp,
          otpExpiry,
        },
      });
    }

    // Send OTP email
    await sendOtpEmail(email, otp, name);

    return res.json({ message: "OTP sent to your email", email });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Step 2: Verify OTP - verifies email and returns token
authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({ error: "No OTP requested. Please register again." });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ error: "OTP has expired. Please register again." });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    // Mark email as verified, clear OTP
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    });

    const token = await createToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
    });

    return res.json({
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Resend OTP
authRouter.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otpCode: otp, otpExpiry },
    });

    await sendOtpEmail(email, otp, user.name);

    return res.json({ message: "OTP resent to your email" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: "Please verify your email first", needsVerification: true, email });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Get current user
authRouter.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Forgot password
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    await sendResetPasswordEmail(email, resetToken, user.name);

    return res.json({ message: "If an account exists, a reset link has been sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Reset password
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

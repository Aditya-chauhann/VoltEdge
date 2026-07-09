/**
 * Auth Controller
 * Handles: register, login, forgot-password (simple DB update, no email).
 * Auth is intentionally simple — demo-grade, per user specification.
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { Cart } from '../models/Cart.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth.middleware';

/** Sign a JWT for the given user */
function signToken(id: string, email: string, role: string): string {
  return jwt.sign({ id, email, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

// ─── Register ────────────────────────────────────────────────────────────────

import { emailService } from '../services/email.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, adminSecret } = req.body as {
    name?: string; email?: string; password?: string; phone?: string; adminSecret?: string;
  };

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Check if admin secret matches
  const role = (adminSecret === 'Admin@123456') ? 'admin' : 'customer';

  // passwordHash field triggers bcrypt hashing in the User pre-save hook
  const user = await User.create({
    name:         name.trim(),
    email:        email.toLowerCase().trim(),
    passwordHash: password,
    phone:        phone?.trim(),
    role:         role,
    isEmailVerified: false,
    otp,
    otpExpiresAt,
  });

  // Create an empty cart for the new user
  await Cart.create({ user: user._id, items: [] });

  // Send OTP
  await emailService.sendRegistrationOTP(user.email, otp);

  res.status(201).json(ok('Registration successful. Please verify your email.', {
    requireOtp: true,
    email: user.email,
  }));
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // select passwordHash explicitly (field has select:false)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isActive) throw new ApiError(403, 'Account deactivated — contact support');

  if (!user.isEmailVerified) {
    // Generate new OTP and send it since they are trying to login unverified
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    await emailService.sendRegistrationOTP(user.email, otp);

    return res.json(ok('Email not verified. A new OTP has been sent.', {
      requireOtp: true,
      email: user.email,
    }));
  }

  const token = signToken(String(user._id), user.email, user.role);

  res.json(ok('Login successful', {
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      phone: user.phone,
    },
  }));
});

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email?: string; otp?: string };

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, 'User not found');

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified');
  }

  if (user.otp !== otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new ApiError(400, 'OTP has expired. Please try logging in to get a new one.');
  }

  // OTP valid!
  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = signToken(String(user._id), user.email, user.role);

  res.json(ok('Email verified successfully', {
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      phone: user.phone,
    },
  }));
});

// ─── Forgot Password (demo — no email, direct DB update) ─────────────────────

export const forgotPasswordStep1 = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) throw new ApiError(400, 'Email is required');

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always respond 200 — don't reveal whether email exists (security best practice)
  // But per user spec, we need to tell them if found so they can show the reset form
  if (!user) {
    throw new ApiError(404, 'No account found with that email address');
  }

  res.json(ok('Email found — you may now reset your password', { emailExists: true }));
});

export const forgotPasswordStep2 = asyncHandler(async (req: Request, res: Response) => {
  const { email, newPassword } = req.body as { email?: string; newPassword?: string };

  if (!email || !newPassword) {
    throw new ApiError(400, 'Email and new password are required');
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw new ApiError(404, 'No account found with that email address');

  // Update the password — the pre-save hook will hash it
  user.passwordHash = newPassword;
  await user.save();

  res.json(ok('Password reset successfully — please log in', {}));
});

// ─── Get current user ────────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  res.json(ok('User fetched', user));
});

// ─── Update profile ───────────────────────────────────────────────────────────

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone } = req.body as { name?: string; phone?: string };

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { $set: { name: name?.trim(), phone: phone?.trim() } },
    { new: true, runValidators: true },
  ).select('-passwordHash');

  if (!user) throw new ApiError(404, 'User not found');

  res.json(ok('Profile updated', user));
});

// ─── Addresses ────────────────────────────────────────────────────────────────

export const addAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;

  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (isDefault) {
    // Remove default flag from all existing addresses
    user.addresses.forEach((a) => { a.isDefault = false; });
  }

  user.addresses.push({ fullName, phone, line1, line2, city, state, pincode, country: country || 'India', isDefault: !!isDefault });
  await user.save();

  res.json(ok('Address added', user.addresses));
});

export const updateAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { addressId } = req.params as { addressId: string };
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  const addr = user.addresses.find((a) => String(a._id) === addressId);
  if (!addr) throw new ApiError(404, 'Address not found');

  const { fullName, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;

  if (isDefault) user.addresses.forEach((a) => { a.isDefault = false; });

  Object.assign(addr, { fullName, phone, line1, line2, city, state, pincode, country, isDefault });
  await user.save();

  res.json(ok('Address updated', user.addresses));
});

export const deleteAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { addressId } = req.params as { addressId: string };
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.addresses = user.addresses.filter(
    (a) => String(a._id) !== addressId,
  ) as typeof user.addresses;
  await user.save();

  res.json(ok('Address deleted', user.addresses));
});

/**
 * User Model
 * Stores account credentials, personal info, multiple delivery addresses,
 * order history references, and wishlist product IDs.
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/** Sub-document schema for a saved delivery address */
export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  fullName:    string;
  phone:       string;
  line1:       string;
  line2?:      string;
  city:        string;
  state:       string;
  pincode:     string;
  country:     string;
  isDefault:   boolean;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName:  { type: String, required: true, trim: true },
    phone:     { type: String, required: true, trim: true },
    line1:     { type: String, required: true, trim: true },
    line2:     { type: String, trim: true },
    city:      { type: String, required: true, trim: true },
    state:     { type: String, required: true, trim: true },
    pincode:   { type: String, required: true, trim: true },
    country:   { type: String, required: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

export interface IUser extends Document {
  name:         string;
  email:        string;
  phone?:       string;
  passwordHash: string;
  role:         'customer' | 'admin';
  addresses:    IAddress[];
  wishlist:     string[];
  isActive:     boolean;
  createdAt:    Date;
  updatedAt:    Date;

  // Instance methods
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name:  { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type:     String,
      required: true,
      unique:   true,
      lowercase: true,
      trim:     true,
    },
    phone:        { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role:         { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses:    { type: [AddressSchema], default: [] },
    wishlist:     [{ type: String }],
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare a plain-text password against the stored hash
UserSchema.methods.comparePassword = async function (
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

// Remove sensitive fields from JSON output
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).passwordHash;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);

import mongoose from "mongoose";
import {
  comparePassword as comparePasswordHash,
  hashPassword,
} from "../../../shared/utils/hashpassword.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must not exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    refreshTokenIssuedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return comparePasswordHash(candidatePassword, this.password);
};

userSchema.virtual("isVerified").get(function () {
  return this.isEmailVerified;
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

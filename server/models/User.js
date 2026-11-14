const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false }, // bcrypt hash
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, default: null, select: false },   // HMAC of OTP, never plaintext
    otpExpiresAt: { type: Date, default: null },
    otpLastSentAt: { type: Date, default: null },              // resend cooldown
    otpAttempts: { type: Number, default: 0 },                 // wrong-guess counter
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete ret.password; delete ret.otpHash; delete ret.otpExpiresAt; delete ret.otpLastSentAt; delete ret.otpAttempts; delete ret.__v; return ret; } },
  }
);

/** Public-safe representation (no password / otp fields). */
userSchema.methods.toPublic = function toPublic() {
  return { id: this._id, fullName: this.fullName, email: this.email, isVerified: this.isVerified, createdAt: this.createdAt };
};
module.exports = mongoose.model('User', userSchema);

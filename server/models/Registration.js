const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true }, email: { type: String, required: true, lowercase: true, trim: true } },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    // unique => one hackathon registration per user, enforced at DB level
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true, minlength: 3 },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    collegeName: { type: String, required: true, trim: true },
    course: { type: String, required: true },
    branch: { type: String, required: true },
    yearOfStudy: { type: String, required: true },
    domain: { type: String, required: true },
    projectName: { type: String, required: true, trim: true, minlength: 5 },
    pptLink: { type: String, required: true, trim: true },
    prototypeLink: { type: String, required: true, trim: true },
    demoVideoLink: { type: String, default: '', trim: true },
    teamSize: { type: Number, required: true, min: 1, max: 5 },
    teamMembers: { type: [memberSchema], default: [] },
    // Whether the confirmation email was actually accepted by the SMTP server
    confirmationEmailStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    confirmationEmailError: { type: String, default: '' }, // server-side only, never serialised
    confirmationEmailLastAttemptAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete ret.confirmationEmailError; delete ret.confirmationEmailLastAttemptAt; delete ret.__v; return ret; } },
  }
);
module.exports = mongoose.model('Registration', registrationSchema);

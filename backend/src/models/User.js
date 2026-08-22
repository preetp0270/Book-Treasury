const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: function () {
        return this.username;
      },
    },
    mpin: {
      type: String,
      required: [true, 'MPIN is required'],
      minlength: [4, 'MPIN must be at least 4 digits'],
      maxlength: [6, 'MPIN cannot exceed 6 digits'],
    },
    preferredTheme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    customFonts: [
      {
        name: String,
        url: String, // Google Fonts CSS link
        family: String,
      },
    ],
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash MPIN before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('mpin')) return next();
  const salt = await bcrypt.genSalt(12);
  this.mpin = await bcrypt.hash(this.mpin, salt);
  next();
});

// Compare MPIN
userSchema.methods.compareMpin = async function (candidateMpin) {
  return bcrypt.compare(candidateMpin, this.mpin);
};

// Hide sensitive fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.mpin;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

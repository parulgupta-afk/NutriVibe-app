const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [
      function () { return !this.googleId; },
      'Please provide a password'
    ],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  // Set only for accounts created/linked via "Sign in with Google".
  // sparse:true means the unique index ignores documents where this
  // field doesn't exist, so regular email/password users are unaffected.
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    select: false
  },
  // Hashed reset token + expiry for the forgot-password flow. We store
  // a hash (not the raw token) so a database leak alone can't be used
  // to reset anyone's password — the raw token only ever exists in the
  // emailed link itself.
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: {
    dietaryRestrictions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    healthGoals: { type: [String], default: [] },
    medications: { type: [String], default: [] }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// ✅ CORRECT pre-save – no `next` parameter, just async
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('🔐 Password hashed successfully');
  } catch (err) {
    console.error('❌ Error hashing password:', err);
    throw err; // will abort save
  }
});

// ✅ Compare password – unchanged
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
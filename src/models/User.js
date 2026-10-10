const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // koi 2 users same email se register nahi kar sakte
      lowercase: true, // hamesha lowercase mein save hoga (Ali@x.com aur ali@x.com alag na hon)
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // by default queries mein password wapas nahi aayega
    },
    role: {
      type: String,
      enum: ['User', 'Admin'], // sirf yehi 2 values allowed hain
      default: 'User', // agar kuch na diya jaye to default User
    },
  },
  {
    timestamps: true, // automatically createdAt aur updatedAt add karta hai
  }
);

module.exports = mongoose.model('User', userSchema);
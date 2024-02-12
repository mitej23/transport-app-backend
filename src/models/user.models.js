import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    userType: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER'
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
  },
  {
    timestamps: true
  }
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      userType: this.userType
    },
    process.env.ACCESS_TOKEN_SECRET
  )
}

export const User = mongoose.model("User", userSchema)

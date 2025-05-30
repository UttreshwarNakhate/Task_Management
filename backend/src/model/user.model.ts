import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdBy?: string;
  updatedBy?: string;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isLoggedIn: {
      type: Boolean,  
      default: false,
    },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

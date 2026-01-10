import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: String;
  email: String;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: String,
    email: String,
  },
  { timestamps: true, versionKey: false }
);

export const User = mongoose.model("User", userSchema);

import { Schema, model } from "mongoose";

interface user {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: string;
  verified: boolean;
}

const UserSchema = new Schema<user>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  phoneNo: { type: String, required: true, trim: true, unique: true },
  role: { type: String, enum: ['admin', 'user', 'rep'], required: true, default: 'user' },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

const User = model<user>("User", UserSchema);

User.init();

export default User;

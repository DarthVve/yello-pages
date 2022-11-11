import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  phoneNo: { type: String, required: true, trim: true, unique: true },
  role: {type: String, enum: ['admin', 'user', 'rep'], required: true, default: 'user'},
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = model("User", UserSchema);

export default User;

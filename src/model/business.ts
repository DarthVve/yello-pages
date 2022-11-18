import { Schema, model, Types } from "mongoose";

interface socialMedia {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  pinterest: string;
  snapchat: string;
}

interface business {
  name: string;
  services: string[];
  rcNumber: string;
  address: string;
  email: string;
  password: string;
  website: string;
  socialMedia: socialMedia;
  logo: string;
  phones: string[];
  verified: boolean;
  cacVerified: boolean;
  rating: number;
  noOfRatings: number;
  reps: [Types.ObjectId];
}

function nonEmpty(arr: string[]) {
  return arr.length > 0;
}

const SocialMediaSchema = new Schema<socialMedia>({
  facebook: { type: String, required: false, trim: true },
  twitter: { type: String, required: false, trim: true },
  instagram: { type: String, required: false, trim: true },
  linkedin: { type: String, required: false, trim: true },
  youtube: { type: String, required: false, trim: true },
  pinterest: { type: String, required: false, trim: true },
  snapchat: { type: String, required: false, trim: true }
}, { _id: false })

const BusinessSchema = new Schema<business>({
  name: { type: String, required: true, unique: true, trim: true },
  services: { type: [String], required: true, validate: [nonEmpty, 'There must be at least one service'] },
  rcNumber: { type: String, required: false, unique: true, trim: true },
  address: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  website: { type: String, required: false, unique: true, trim: true },
  socialMedia: { type: SocialMediaSchema, required: false },
  logo: { type: String, required: false },
  phones: { type: [String], validate: [nonEmpty, 'There must be at least one phone number'] },
  verified: { type: Boolean, default: false },
  cacVerified: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 100, default: 0 },
  noOfRatings: { type: Number, default: 0 },
  reps: { type: [Schema.Types.ObjectId], ref: "User", required: false }
}, { timestamps: true });

const Business = model<business>("Business", BusinessSchema);

export default Business;

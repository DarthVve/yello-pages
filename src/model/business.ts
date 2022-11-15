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
  website: string;
  socialMedia: socialMedia;
  phones: string[];
  verified: boolean;
  rating?: number;
  rep: Types.ObjectId;
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
  rcNumber: { type: String, required: true, unique: true, trim: true },
  address: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  website: { type: String, unique: true, trim: true },
  socialMedia: SocialMediaSchema,
  phones: { type: [String], validate: [nonEmpty, 'There must be at least one phone number'] },
  verified: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 100, required: false },
  rep: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const Business = model<business>("Business", BusinessSchema);

export default Business;

import { Schema, model, Types } from "mongoose";

interface rating {
  user: Types.ObjectId;
  business: Types.ObjectId;
  rating: number;
}

const RatingSchema = new Schema<rating>({
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  business: { type: Schema.Types.ObjectId, required: true, ref: "Business" },
  rating: { type: Number, required: true, min: 0, max: 100 }
}, { timestamps: true });

const Rating = model<rating>("Rating", RatingSchema);

export default Rating;

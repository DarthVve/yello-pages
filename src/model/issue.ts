import { Schema, model, ObjectId } from "mongoose";

type status = "open" | "closed";

interface issue {
  title: string;
  description: string;
  attachments: string[];
  status: status;
  user: ObjectId;
  business: ObjectId;
}

const IssueSchema = new Schema<issue>({
  title: { type: String, trim: true },
  description: { type: String, required: true, trim: true },
  attachments: [String],
  status: { type: String, enum: ["open", "closed"], default: "open" },
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  business: { type: Schema.Types.ObjectId, ref: "Business" }
}, { timestamps: true });

const Issue = model<issue>("Issue", IssueSchema);

export default Issue;

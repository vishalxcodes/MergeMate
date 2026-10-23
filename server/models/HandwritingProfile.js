import mongoose from "mongoose";

const glyphSchema = new mongoose.Schema(
  {
    char: { type: String, required: true },
    data: { type: String, required: true }, // base64 PNG
  },
  { _id: false }
);

const handwritingProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user; re-calibrating overwrites it
    },
    glyphs: { type: [glyphSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("HandwritingProfile", handwritingProfileSchema);
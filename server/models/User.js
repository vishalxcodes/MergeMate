import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: { type: String, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
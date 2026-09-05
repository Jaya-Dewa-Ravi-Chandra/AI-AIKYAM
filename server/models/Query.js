import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    query: { type: String, required: true, trim: true, minlength: 5, maxlength: 2000 }
  },
  { timestamps: true }
);

export default mongoose.model("Query", querySchema);

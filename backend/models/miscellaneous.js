import mongoose from "mongoose";

const miscSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  type: {
    type: String,
    required: true,
  },
});

const Miscellaneous = mongoose.model("Miscellaneous", miscSchema);

export default Miscellaneous;

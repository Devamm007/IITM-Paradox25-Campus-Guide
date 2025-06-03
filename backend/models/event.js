import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  locations: [
    {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  ],
  documentLink: {
    type: String,
    required: true,
  },
  organiserEmail: {
    type: String,
  },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;

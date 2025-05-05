import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";

import Event from "./models/event.js";
import Miscellaneous from "./models/miscellaneous.js";

const app = express();

const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

// mongo connect
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((e) => {
    console.log("Error connecting MongoDB" + e);
  });

app.get("/", (req, res) => {
  return res.send("hi from backend");
});

app.get("/events", async (req, res) => {
  const events = await Event.find({});
  // console.log(events);
  // events is an array of objects
  return res.json({ events });
});

app.get("/event/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json({
      msg: "Give valid id",
    });
  }
  const event = await Event.findOne({ _id: id });
  if (!event) {
    return res.send("wrong id passed");
  }
  // console.log(event);
  // event is a object
  return res.send("hello from /event/id");
});

app.get("/miscellaneous", async (req, res) => {
  const misc = await Miscellaneous.find({});
  // console.log(misc);
  // misc is array of objects
  res.send("hi from misc");
});

app.get("/miscellaneous/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.send("wrong id passed");
  }
  const misc = await Miscellaneous.findById(id);
  if (!misc) {
    return res.send("wrong id passed");
  }
  // console.log(misc);
  return res.send("hi from /misc/:id");
});

app.listen(PORT, () => {
  console.log("server listening on port 8000");
});

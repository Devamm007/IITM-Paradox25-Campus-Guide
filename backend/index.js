import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";

import Event from "./models/event.js";
import Miscellaneous from "./models/miscellaneous.js";
import nunjucks from "nunjucks";

const app = express();

const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

app.set("view engine", "html")

const env = nunjucks.configure('views', {
  express: app,
  autoescape: true,
  watch: true,  // This is the key option - watches for template changes
  noCache: true // Disable caching in development
});

env.addFilter('toIST', (utcTimeStr) => {
  const date = new Date(utcTimeStr);
  date.setHours(date.getHours() + 5);
  date.setMinutes(date.getMinutes() + 30);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
  });
});

app.use(express.urlencoded({ extended: false }))
app.use('/static', express.static("static"));

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
  return res.render("home");
});

app.get("/events", async (req, res) => {
  const events = await Event.find({});
  events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  // console.log(events);
  // events is an array of objects
  return res.render("events", {events});
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
  res.render("miscellaneous", {misc});
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

app.get("/webteam", (req, res) => {
  return res.render("webteam");
});

app.listen(PORT, () => {
  console.log("server listening on port 8000");
});

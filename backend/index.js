import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import express from "express";
import mongoose from "mongoose";

import Event from "./models/event.js";
import Miscellaneous from "./models/miscellaneous.js";
import nunjucks from "nunjucks";

const app = express();

app.use(cors());
const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const secret = process.env.secret;

app.set("view engine", "html");

const env = nunjucks.configure("views", {
  express: app,
  autoescape: true,
  watch: true, // This is the key option - watches for template changes
  noCache: true, // Disable caching in development
});

app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static("static"));

// mongo connect
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((e) => {
    console.log("Error connecting MongoDB" + e);
  });

app.get("/", async (req, res) => {
  const events = await Event.find({});
  return res.send(events);
  // return res.render("home");
});

app.get("/events", async (req, res) => {
  const events = await Event.find({});
  const query = "";
  events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  // console.log(events);
  // events is an array of objects
  return res.render("events", { events, query });
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
  // console.log(misc);
  // misc is array of objects
  res.render("miscellaneous");
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

// secret route
app.get("/shakalakaboomboom", async (req, res) => {
  const events = await Event.find({});
  events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  res.render("admin", { events });
});

// post route for creation
app.post("/shakalakaboomboom", async (req, res) => {
  const name = req.body.name;
  const startTime = req.body.start;
  const endTime = req.body.end;
  const locName = req.body.locName;
  const lat = Number(req.body.lat);
  const long = Number(req.body.long);

  try {
    // secret for us
    if (req.body.secret !== secret) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Event.create({
      name,
      startTime,
      endTime,
      locations: [{ name: locName, latitude: lat, longitude: long }],
      documentLink: "example",
      organiserEmail: "example@ds.study.iitm.ac.in",
    });
    alert("created event successfully");
    return res.redirect("/shakalakaboomboom");
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

// get route for edit
app.get("/shakalakaboomboom/edit/:id", async (req, res) => {
  const id = req.params.id;
  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({ msg: "event not found!" });
  }
  res.send("load event edit form");
});

// post route for edit
app.post("/shakalakaboomboom/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const secretPassed = req.body.secret;
    if (secretPassed !== secret) {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    const { name, startTime, endTime, locName, lat, long } = req.body;

    const updated = await Event.findByIdAndUpdate(
      id,
      {
        name,
        startTime,
        endTime,
        locations: [{ name: locName, latitude: lat, longitude: long }],
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json("event not found");
    }
    alert("Event updated");
    res.redirect("/shakalakaboomboom");
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// delete route
app.post("/shakalakaboomboom/delete/:id", async (req, res) => {
  if (req.body.secret !== secret) {
    return res.status(403).json({ msg: "Unauthorized" });
  }

  const deleted = await Event.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ msg: "Event not found" });
  }
  alert("Event deleted");
  res.redirect("admin");
});

// event search - case in-sensitive and with regular expressions
app.get("/search", async (req, res) => {
  const query = req.query.q;
  const events = await Event.find({
    name: { $regex: query, $options: "i" },
  });

  if (events.length === 0) {
    return res.status(404).json({ msg: "No events found" });
  }
  return res.render("events", { events, query });
});

app.listen(PORT, () => {
  console.log("server listening on port 8000");
});

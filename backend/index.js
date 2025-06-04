import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import express from "express";
// import mongoose from "mongoose";

import Event from "./models/event.js";
import Miscellaneous from "./models/miscellaneous.js";
import { promises as fs } from 'fs';

// import nunjucks from "nunjucks";
// import path from 'path';

const app = express();

app.use(cors());
// const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const secret = process.env.secret;

app.set("view engine", "html");

import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/static', express.static(path.join(__dirname + '/static')));
nunjucks.configure(path.join(__dirname, "views"), {
  express: app,
  autoescape: true,
  watch: true,
  noCache: true,
});


const env = nunjucks.configure(path.join(__dirname, 'views'), {
  express: app,
  autoescape: true,
  watch: process.env.NODE_ENV === 'development', // Disable in production
  noCache: process.env.NODE_ENV !== 'production' // Enable cache in production
});

app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static("static"));

// // mongo connect
// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected successfully");
//   })
//   .catch((e) => {
//     console.log("Error connecting MongoDB" + e);
//   });


// Helper function to load JSON data
async function loadJSONData(filename) {
  try {
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}

app.get("/", (req, res) => {
  return res.render("home");
});

app.get("/events", async (req, res) => {
  const events = await loadJSONData('events.json');
  const query = "";
  events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  // console.log(events);
  // events is an array of objects
  return res.render("events", { events, query });
});

app.get("/miscellaneous", async (req, res) => {
  // console.log(misc);
  // misc is array of objects
  res.render("miscellaneous");
});

app.get("/webteam", (req, res) => {
  return res.render("webteam");
});


// event search - case in-sensitive and with regular expressions
app.get("/search", async (req, res) => {
  const query = req.query.q;
  const events = await loadJSONData('events.json');
    
  const regex = new RegExp(query, "i");
  const filteredEvents = events.filter(event =>
    regex.test(event.name) ||
    (event.locations && event.locations.some(loc =>
      regex.test(loc.name)
    ))
  );
  // const events = await Event.find({
  //   name: { $regex: query, $options: "i" },
  // });

  if (Object.keys(filteredEvents).length > 0) {
    return res.render("events", { filteredEvents, query });
  }
  const f = "true"
  return res.render("events", {filteredEvents, f});
});



app.listen(PORT, () => {
  console.log("server listening on port 8000");
});

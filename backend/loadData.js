import dotenv from "dotenv";
dotenv.config();

import { readFile } from "fs/promises";

import mongoose from "mongoose";
import Event from "./models/event.js";
import Miscellaneous from "./models/miscellaneous.js";

const eventdatajson = await readFile("./data/EventDataset.json", "utf-8");
const EventData = JSON.parse(eventdatajson);

// const miscdatajson = await readFile("./data/MiscDataset.json", "utf-8");
// const MiscData = JSON.parse(miscdatajson);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    // add Event Data
    await Event.deleteMany();
    await Event.insertMany(EventData);
    console.log("Event data loaded successfully !!");

    // // add miscellaneous data
    // await Miscellaneous.deleteMany();
    // await Miscellaneous.insertMany(MiscData);
    // console.log("Miscellaneous data added successfully !!");

    mongoose.connection.close();
  })
  .catch((e) => {
    console.log("Error occured while loading data !" + e);
  });

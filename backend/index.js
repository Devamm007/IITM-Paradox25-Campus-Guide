import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";

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
  res.send("hi from backend");
});

app.listen(PORT, () => {
  console.log("server listening on port 8000");
});

// backend code over here
import express, { urlencoded } from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("hi from backend");
});

app.listen(8000, () => {
  console.log("server listening on port 8000");
});

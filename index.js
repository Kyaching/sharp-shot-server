const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1cwqvry.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    client.connect();
    console.log("Database Connected");
  } catch (err) {
    console.log("Error occurred", err);
  }
}
connectDB();

app.get("/", (req, res) => {
  res.send("Photography Server is Running");
});

app.listen(port, () => {
  console.log(`Photography Server is running on Port: ${port}`);
});

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

const Services = client.db("photographyReview").collection("services");

app.get("/services", async (req, res) => {
  try {
    const page = Number(req.query.page);
    const cursor = Services.find({});
    const services = await cursor.limit(page).toArray();
    const count = await Services.estimatedDocumentCount();
    res.send({
      success: true,
      message: "Data Got Successfully",
      data: services,
      count,
    });
  } catch (err) {
    res.send({
      success: false,
      message: `Error Occurred ${err}`,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Photography Server is Running");
});

app.listen(port, () => {
  console.log(`Photography Server is running on Port: ${port}`);
});

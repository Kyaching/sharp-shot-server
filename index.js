const { MongoClient, ObjectId } = require("mongodb");
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
const Reviews = client.db("photographyReview").collection("reviews");

// services
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

app.get("/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await Services.findOne(query);
    res.send({
      success: true,
      message: "Data Got Successfully",
      data: service,
    });
  } catch (err) {
    res.send({
      success: false,
      message: `Error Occurred ${err}`,
    });
  }
});

// reviews
app.get("/reviews", async (req, res) => {
  try {
    const cursor = Reviews.find({});
    const reviews = await cursor.toArray();
    res.send({
      success: true,
      message: "Data Got Successfully",
      data: reviews,
    });
  } catch (err) {
    res.send({
      success: false,
      message: `Error Occurred ${err}`,
    });
  }
});
app.post("/reviews", async (req, res) => {
  try {
    const review = req.body;
    const result = await Reviews.insertOne(review);
    res.send({
      success: true,
      message: "Data send Successfully",
      data: result,
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

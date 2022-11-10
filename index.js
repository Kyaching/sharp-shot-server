const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1cwqvry.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

// jwt token middleware
function verifyJWT(req, res, next) {
  const headersToken = req.headers.authorization;

  if (!headersToken) {
    return res.status(401).send({
      success: false,
      message: "unauthorized access",
    });
  }
  next();
}

async function connectDB() {
  try {
    client.connect();
  } catch (err) {
    console.log("Error occurred", err);
  }
}
connectDB();

const Services = client.db("photographyReview").collection("services");
const Reviews = client.db("photographyReview").collection("reviews");

// jwt token
app.post("/jwt", (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2d",
    });
    res.send({
      success: true,
      message: "Data Send Successfully",
      data: { token },
    });
  } catch (err) {
    res.send({
      success: false,
      message: `Error Occurred ${err}`,
    });
  }
});

// services
app.get("/services", async (req, res) => {
  try {
    const page = Number(req.query.page);
    const cursor = Services.find({}).sort({ date: -1 });
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
app.post("/services", async (req, res) => {
  try {
    const query = req.body;
    const service = Services.insertOne(query);
    res.send({
      success: true,
      message: "Data Send Successfully",
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
app.get("/reviews", verifyJWT, async (req, res) => {
  try {
    let query = {};
    if (req.query.email) {
      query = {
        email: req.query.email,
      };
    }
    if (req.query.serviceId) {
      query = {
        serviceId: req.query.serviceId,
      };
    }
    const cursor = Reviews.find(query);
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

app.patch("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const review = req.body.review;
    const query = { _id: ObjectId(id) };
    const updateReview = {
      $set: {
        review,
      },
    };
    const result = await Reviews.updateOne(query, updateReview);
    res.send({
      success: true,
      message: "Data Successfully Updated",
      data: result,
    });
  } catch (err) {
    res.send({
      success: false,
      message: `Error Occurred ${err}`,
    });
  }
});
app.delete("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await Reviews.deleteOne(query);
    res.send({
      success: true,
      message: "Data Successfully deleted",
      data: result,
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

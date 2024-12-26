const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["https://services-review.netlify.app"],
    credentials: true,
    optionalSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjfhp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }

    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    const database = client.db("serviceDB");
    const userCollection = database.collection("users");

    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.get("/logout", async (req, res) => {
      try {
        res.clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.status(200).send({ success: true });
      } catch (error) {
        return res.status(500).send({ message: "Server error" });
      }
    });

    // Add new user
    app.post("/users/add", (req, res) => {
      const { email, name, photoURL } = req.body;
      userCollection
        .findOne({ email })
        .then((existingUser) => {
          if (!existingUser) {
            userCollection.insertOne({ email, name, photoURL });
          }
        })
        .catch((error) => {
          console.error("Error adding user:", error);
        });
    });

    // Get all user
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // service
    const serviceCollection = database.collection("service");

    app.get("/services", async (req, res) => {
      const keyword = req.query.keyword || "";
      const category = req.query.category || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const skip = (page - 1) * limit;

      let query = {};

      if (keyword) {
        query.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } },
          { company: { $regex: keyword, $options: "i" } },
        ];
      }

      if (category && category !== "All Categories") {
        query.category = category;
      }
      try {
        const total = await serviceCollection.countDocuments(query);
        const services = await serviceCollection
          .find(query)
          .skip(skip)
          .limit(limit)
          .toArray();
        res.send({
          services,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        });
      } catch (err) {
        res
          .status(500)
          .send({ message: "Error fetching services", error: err });
      }
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    // featured service
    app.get("/services/featured", async (req, res) => {
      const cursor = serviceCollection.find().limit(6);
      const service = await cursor.toArray();
      res.send(service);
    });

    //  post a service
    app.post("/service/add", verifyToken, async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
    // update a service
    app.put("/service/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: req.body,
      };
      const result = await serviceCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // delete a service
    app.delete("/service/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
    // Get services for a specific user by email
    app.get("/service/me/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const decodedEmail = req.user?.email;
      if (decodedEmail !== email)
        return res.status(401).send({ message: "unauthorized access" });

      const query = {
        userEmail: email,
      };
      const services = await serviceCollection.find(query).toArray();
      res.send(services);
    });

    // reviews
    const reviewsCollection = database.collection("reviews");
    // get all reviews
    app.get("/reviews/all", async (req, res) => {
      const cursor = reviewsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get reviews for a specific service by id
    app.get("/reviews/:serviceId", async (req, res) => {
      const { serviceId } = req.params;
      const query = { serviceId };
      const reviews = await reviewsCollection.find(query).toArray();
      res.send(reviews);
    });

    // Get reviews for a specific user by email
    app.get("/reviews/me/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const query = {
        userEmail: email,
      };
      const reviews = await reviewsCollection.find(query).toArray();
      res.send(reviews);
    });
    //  Add a new review
    app.post("/reviews/add", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // get review by id
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const review = await reviewsCollection.findOne(query);
      res.send(review);
    });
    // update review
    app.put("/review/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: req.body,
      };
      const result = await reviewsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // delete review
    app.delete("/review/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Service Provider server is running");
});

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});

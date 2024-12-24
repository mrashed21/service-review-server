const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjfhp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const database = client.db("serviceDB");
    const serviceCollection = database.collection("service");

    // get all services
    // app.get("/services", async (req, res) => {
    //   const cursor = serviceCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // Get all services with search functionality
    app.get("/services", async (req, res) => {
      const keyword = req.query.keyword || "";

      const query = {
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } },
          { companyName: { $regex: keyword, $options: "i" } },
        ],
      };

      const cursor = serviceCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get a service by id
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    //  post a service
    app.post("/service/add", async (req, res) => {
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
    app.get("/service/me/:email", async (req, res) => {
      const { email } = req.params;
      console.log("Received Email:", email);
      const query = {
        userEmail: email,
      };
      const services = await serviceCollection.find(query).toArray();
      res.send(services);
    });

    // reviews
    //  Add a new review
    const reviewsCollection = database.collection("reviews");
    app.post("/reviews/add", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // Fetch reviews by service ID
    app.get("/reviews/:serviceId", async (req, res) => {
      const { serviceId } = req.params;
      const query = { serviceId };
      const reviews = await reviewsCollection.find(query).toArray();
      res.send(reviews);
    });
    // Get reviews for a specific user by email
    app.get("/reviews/me/:email", async (req, res) => {
      const { email } = req.params;
      const query = {
        userEmail: email,
      };
      const reviews = await reviewsCollection.find(query).toArray();
      res.send(reviews);
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

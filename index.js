const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// MongoDB URI
const uri = "mongodb+srv://assignment-10:4Vz2SNpf763jJ8GZ@cluster0.q7tqgdi.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("assignment-10 server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("assignment_10_db");
    const productsCollection = db.collection("pruducts");
    const reviewsCollection = db.collection("reviews");

    // ----------------------------
    // Products Routes
    // ----------------------------
    app.post("/pruducts", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.get("/pruducts", async (req, res) => {
      try {
        const topProducts = await productsCollection
          .find({})
          .sort({ rating: -1 })
          .limit(6)
          .toArray();
        res.send(topProducts);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch products" });
      }
    });

    // ----------------------------
    // Reviews Routes
    // ----------------------------

    // POST new review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // GET all reviews sorted by date (newest first)
    app.get("/reviews", async (req, res) => {
      try {
        const { email } = req.query; // optional query to filter by user
        const query = email ? { userEmail: email } : {};
        const reviews = await reviewsCollection
          .find(query)
          .sort({ date: -1 })
          .toArray();
        res.send(reviews);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch reviews" });
      }
    });

    // GET single review by ID
    app.get("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
        if (!review) return res.status(404).send({ message: "Review not found" });
        res.send(review);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch review" });
      }
    });

    // PUT update review by ID
    app.put("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      try {
        const result = await reviewsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0)
          return res.status(404).send({ message: "Review not found" });

        res.send({ message: "Review updated successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to update review" });
      }
    });

    // DELETE review by ID
    app.delete("/reviews/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0)
          return res.status(404).send({ message: "Review not found" });

        res.send({ message: "Review deleted successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to delete review" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("pinged your deployment successfully");
  } finally {
    // Optional cleanup
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`simple crud server is running on port ${port}`);
});

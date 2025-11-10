// const express = require("express");
// const cors = require("cors");
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

// const uri = "mongodb+srv://assignment-10:4Vz2SNpf763jJ8GZ@cluster0.q7tqgdi.mongodb.net/?appName=Cluster0";


const uri = process.env.MONGO_URI;

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
    const favoritesCollection = db.collection("favorites"); // NEW COLLECTION

    // ---------------------------- Products ----------------------------
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
        res.status(500).send({ message: "Failed to fetch products" });
      }
    });

    // ---------------------------- Reviews ----------------------------

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // Search + Get all reviews
    app.get("/reviews", async (req, res) => {
      try {
        const { email, search } = req.query;
        let query = {};

        if (email) query.userEmail = email;
        if (search) query.foodName = { $regex: search, $options: "i" }; // case-insensitive search

        const reviews = await reviewsCollection
          .find(query)
          .sort({ date: -1 })
          .toArray();

        res.send(reviews);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch reviews" });
      }
    });

    app.get("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
        if (!review) return res.status(404).send({ message: "Review not found" });
        res.send(review);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch review" });
      }
    });

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
        res.status(500).send({ message: "Failed to update review" });
      }
    });

    app.delete("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0)
          return res.status(404).send({ message: "Review not found" });

        res.send({ message: "Review deleted successfully" });
      } catch (err) {
        res.status(500).send({ message: "Failed to delete review" });
      }
    });

    // ---------------------------- Favorites System ----------------------------

    // Add to favorites
    app.post("/favorites", async (req, res) => {
      const favorite = req.body;
      const result = await favoritesCollection.insertOne(favorite);
      res.send(result);
    });

    // Get favorites by logged in user
    app.get("/favorites", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email is required" });

      const favorites = await favoritesCollection.find({ userEmail: email }).toArray();
      res.send(favorites);
    });

    // Remove from favorites (optional)
    app.delete("/favorites/:id", async (req, res) => {
      const { id } = req.params;
      const result = await favoritesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log("Database Connected Successfully");
  } finally {}
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

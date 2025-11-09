const express = require("express")
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

//assignment-10
//4Vz2SNpf763jJ8GZ

app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://assignment-10:4Vz2SNpf763jJ8GZ@cluster0.q7tqgdi.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('assignemtn-10 server is running')
})

// async function run() {
//     try {
//         await client.connect()
//         const db = client.db('assignment_10_db')
//         const collection = db.collection('pruducts')

//         app.post('/pruducts', async (req, res) => {
//             const newProduct = req.body
//             const result = await collection.insertOne(newProduct)
//             res.send(result)
//         })
//         // GET top 6 reviews/products by rating
//         app.get("/pruducts", async (req, res) => {
//             try {
//                 const topReviews = await collection
//                     .find({})
//                     .sort({ rating: -1 }) // highest rating first
//                     .limit(6)
//                     .toArray();
//                 res.send(topReviews);
//             } catch (err) {
//                 console.error(err);
//                 res.status(500).send({ message: "Failed to fetch top reviews" });
//             }
//         });


//         await client.db('admin').command({ ping: 1 })
//         console.log("pinged you deployment successfully")
//     }
//     finally {

//     }

// }
async function run() {
    try {
        await client.connect()

        const db = client.db('assignment_10_db')
        const productsCollection = db.collection('pruducts')
        const reviewsCollection = db.collection('reviews')   // NEW COLLECTION

        // POST product
        app.post('/pruducts', async (req, res) => {
            const newProduct = req.body
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })

        // GET top 6 products sorted by rating
        app.get("/pruducts", async (req, res) => {
            try {
                const topReviews = await productsCollection
                    .find({})
                    .sort({ rating: -1 })
                    .limit(6)
                    .toArray();
                res.send(topReviews);
            } catch (err) {
                console.error(err);
                res.status(500).send({ message: "Failed to fetch top reviews" });
            }
        });

        // ================================
        // ✅ NEW: SAVE A REVIEW
        // ================================
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        // ================================
        // ✅ NEW: GET ALL REVIEWS SORTED BY DATE (NEWEST FIRST)
        // ================================
        app.get("/reviews", async (req, res) => {
            const result = await reviewsCollection
                .find()
                .sort({ date: -1 })
                .toArray();
            res.send(result);
        });

        await client.db('admin').command({ ping: 1 })
        console.log("pinged your deployment successfully")
    }
    finally {

    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log(`simple crud  sever is running on port ${port}`)
})
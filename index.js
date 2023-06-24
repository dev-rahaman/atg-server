const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGODB_USER_KEY}:${process.env.MONGODB_PASS_KEY}@cluster0.bk91ias.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const articlesCollection = client.db("atg").collection("articles");
const educationsCollection = client.db("atg").collection("educations");
const eventsCollection = client.db("atg").collection("events");
const jobsCollection = client.db("atg").collection("jobs");
const usersCollection = client.db("atg").collection("users");

app.get("/", (req, res) => {
  res.send("hello world");
});

// POST
app.post("/article", async (req, res) => {
  const article = req.body;
  const result = articlesCollection.insertOne(article);
  res.send(result);
});

app.post("/education", async (req, res) => {
  const education = req.body;
  const result = educationsCollection.insertOne(education);
  res.send(result);
});

app.post("/event", async (req, res) => {
  const event = req.body;
  const result = eventsCollection.insertOne(event);
  res.send(result);
});

app.post("/job", async (req, res) => {
  const job = req.body;
  const result = jobsCollection.insertOne(job);
  res.send(result);
});

// GET
app.get("/education", async (req, res) => {
  const result = await educationsCollection.find().toArray();
  res.send(result);
});

app.get("/articles", async (req, res) => {
  const result = await articlesCollection.find().toArray();
  res.send(result);
});

app.get("/event", async (req, res) => {
  const result = await eventsCollection.find().toArray();
  res.send(result);
});

app.get("/job", async (req, res) => {
  const result = await jobsCollection.find().toArray();
  res.send(result);
});

app.get("/all-data", async (req, res) => {
  try {
    const articleData = await articlesCollection.find({}).toArray();
    const eventData = await eventsCollection.find({}).toArray();
    const educationData = await educationsCollection.find({}).toArray();
    const jobData = await jobsCollection.find({}).toArray();

    const allData = [
      ...articleData,
      ...eventData,
      ...educationData,
      ...jobData,
    ];
    const shuffledData = shuffleArray(allData);

    res.json(shuffledData);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching random data." });
  }
});

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Registration
app.post("/users", async (req, res) => {
  const users = req.body;
  const result = usersCollection.insertOne(users);
  res.send(result);
});

// Login

// like
app.patch("/like/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  try {
    const article = await articlesCollection.findOne(filter);
    let likeCount = parseInt(article.like);
    likeCount = isNaN(likeCount) ? 0 : likeCount;

    const updateDoc = { $set: { like: likeCount + 1 } };
    const result = await articlesCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the like count.");
  }
});

app.patch("/event-like/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  try {
    const event = await eventsCollection.findOne(filter);
    let likeCount = parseInt(event.like);
    likeCount = isNaN(likeCount) ? 0 : likeCount;

    const updateDoc = { $set: { like: likeCount + 1 } };
    const result = await eventsCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the like count.");
  }
});

app.patch("/job-like/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  try {
    const job = await jobsCollection.findOne(filter);
    let likeCount = parseInt(job.like);
    likeCount = isNaN(likeCount) ? 0 : likeCount;

    const updateDoc = { $set: { like: likeCount + 1 } };
    const result = await jobsCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the like count.");
  }
});

app.patch("/education-like/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  try {
    const education = await educationsCollection.findOne(filter);
    let likeCount = parseInt(education.like);
    likeCount = isNaN(likeCount) ? 0 : likeCount;

    const updateDoc = { $set: { like: likeCount + 1 } };
    const result = await educationsCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the like count.");
  }
});

app.listen(port, () => {
  console.log(`atg is running on port ${port}`);
});

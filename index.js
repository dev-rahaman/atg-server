const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const port = process.env.PORT || 5000;
const SECRET_KEY = "sdjl;fdsti9fodfjo;sdjffdm";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { ObjectId } = mongoose.Types;

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      token.split(" ")[1];
      const user = jwt.verify(token, SECRET_KEY);
      req.userId = user._id;
    } else {
      res.status(404).send({ message: "Unauthorize user" });
    }
    next();
  } catch (error) {
    res.status(404).send({ message: "Unauthorize user" });
  }
};

const commentSchema = new mongoose.Schema({
  // userId: String,
  postId: String,
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const dataSchema = new mongoose.Schema({
  bloggerName: String,
  bloggerImage: String,
  blogImage: String,
  blogTitle: String,
  blogParagraph: String,
  category: String,
  like: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// userSchema
const userSchema = new mongoose.Schema({
  userName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// all models
const Comments = mongoose.model("Comments", commentSchema);

// data  model
const Educations = mongoose.model("Educations", dataSchema);
const Articles = mongoose.model("Articles", dataSchema);
const Events = mongoose.model("Events", dataSchema);
const Jobs = mongoose.model("Jobs", dataSchema);

// user model
const Users = mongoose.model("Users", userSchema);

const uri = `mongodb+srv://${process.env.MONGODB_USER_KEY}:${process.env.MONGODB_PASS_KEY}@cluster0.bk91ias.mongodb.net/atg?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB is Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.send("hello world");
});

// Forgot Password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.patch("/set-new-password", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    user.password = hashPassword;
    await user.save();

    res.status(200).json({ message: "update password successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Registration
app.post("/users", async (req, res) => {
  const { email, password, userName } = req.body;
  try {
    // check Existing users
    const existingUser = await Users.findOne({ email: email });
    if (existingUser) {
      // 1
      return res.status(400).send({ message: "user already existing" });
    }

    //incipit the password
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      email: email,
      password: hashPassword,
      userName: userName,
    });

    const result = await newUser.save();

    // generate token
    const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);

    res.status(201).send({ user: result, token: token });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await Users.findOne({ email: email });
  try {
    // check existing user
    if (!existingUser) {
      res.status(404).send({ message: "user not found" });
    }
    // match Password
    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      return res.status(404).send({ message: "invalid credentials" });
    }

    // generate token
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      SECRET_KEY
    );
    res.status(200).send({ user: existingUser, token: token });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST
app.post("/article", async (req, res) => {
  try {
    const newArticle = new Articles({
      email: req.body.email,
      bloggerName: req.body.bloggerName,
      bloggerImage: req.body.bloggerImage,
      blogImage: req.body.blogImage,
      blogTitle: req.body.blogTitle,
      blogParagraph: req.body.blogParagraph,
      category: req.body.category,
      like: req.body.like,
    });
    const result = await newArticle.save();
    res.status(202).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/education", async (req, res) => {
  try {
    const newEducation = new Educations({
      email: req.body.email,
      bloggerName: req.body.bloggerName,
      bloggerImage: req.body.bloggerImage,
      blogImage: req.body.blogImage,
      blogTitle: req.body.blogTitle,
      blogParagraph: req.body.blogParagraph,
      category: req.body.category,
      like: req.body.like,
    });
    const result = await newEducation.save();
    res.status(202).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/event", async (req, res) => {
  try {
    const newEvents = new Events({
      email: req.body.email,
      bloggerName: req.body.bloggerName,
      bloggerImage: req.body.bloggerImage,
      blogImage: req.body.blogImage,
      blogTitle: req.body.blogTitle,
      blogParagraph: req.body.blogParagraph,
      category: req.body.category,
      like: req.body.like,
    });
    const result = await newEvents.save();
    res.status(202).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/job", async (req, res) => {
  try {
    const newJobs = new Jobs({
      email: req.body.email,
      bloggerName: req.body.bloggerName,
      bloggerImage: req.body.bloggerImage,
      blogImage: req.body.blogImage,
      blogTitle: req.body.blogTitle,
      blogParagraph: req.body.blogParagraph,
      category: req.body.category,
      like: req.body.like,
    });
    const result = await newJobs.save();
    res.status(202).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// UPDATE
app.put("/:resource/:id", async (req, res) => {
  try {
    const resource = req.params.resource;
    const resourceId = req.params.id;
    const updatedData = req.body;

    // Update the resource based on the specified type
    let result;
    switch (resource) {
      case "article":
        result = await Articles.findByIdAndUpdate(resourceId, updatedData, {
          new: true,
        });
        break;
      case "education":
        result = await Educations.findByIdAndUpdate(resourceId, updatedData, {
          new: true,
        });
        break;
      case "job":
        result = await Jobs.findByIdAndUpdate(resourceId, updatedData, {
          new: true,
        });
        break;
      case "event":
        result = await Events.findByIdAndUpdate(resourceId, updatedData, {
          new: true,
        });
        break;
      default:
        return res.status(400).send({ message: "Invalid resource type" });
    }

    if (!result) {
      return res.status(404).send({ message: "Resource not found" });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DELETE
app.delete("/:resource/:id", async (req, res) => {
  try {
    const resource = req.params.resource;
    const resourceId = req.params.id;

    // Delete the resource based on the specified type
    let result;
    switch (resource) {
      case "article":
        result = await Articles.findByIdAndDelete(resourceId);
        break;
      case "education":
        result = await Educations.findByIdAndDelete(resourceId);
        break;
      case "job":
        result = await Jobs.findByIdAndDelete(resourceId);
        break;
      case "event":
        result = await Events.findByIdAndDelete(resourceId);
        break;
      default:
        return res.status(400).send({ message: "Invalid resource type" });
    }

    if (!result) {
      return res.status(404).send({ message: "Resource not found" });
    }

    res.status(200).send({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ----------------------------GET----------------------------
app.get("/educations", async (req, res) => {
  try {
    const result = await Educations.find();
    res.send(result);
  } catch (error) {
    res.status(500).send("An error occurred while getting all Education.");
  }
});

app.get("/articles", async (req, res) => {
  try {
    const result = await Articles.find();
    res.send(result);
  } catch (error) {
    res.status(500).send("An error occurred while getting all articles.");
  }
});

app.get("/events", async (req, res) => {
  try {
    const result = await Events.find();
    res.send(result);
  } catch (error) {
    res.status(500).send("An error occurred while getting all Events.");
  }
});

app.get("/jobs", async (req, res) => {
  try {
    const result = await Jobs.find();
    res.send(result);
  } catch (error) {
    res.status(500).send("An error occurred while getting all JObs.");
  }
});

app.get("/all-data", async (req, res) => {
  try {
    const articleData = await Articles.find({});
    const eventData = await Events.find({});
    const educationData = await Educations.find({});
    const jobData = await Jobs.find({});

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

// like
app.patch("/like/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  try {
    const article = await Articles.findOne(filter);
    let likeCount = parseInt(article.like);
    likeCount = isNaN(likeCount) ? 0 : likeCount;

    const updateDoc = { $set: { like: likeCount + 1 } };
    const result = await Articles.updateOne(filter, updateDoc);
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
    const event = await Events.findOne(filter);
    let likeCount = parseInt(event.like);
    likeCount = isNaN(likeCount) ? 0 : likeCount;

    const updateDoc = { $set: { like: likeCount + 1 } };
    const result = await Events.updateOne(filter, updateDoc);
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
    const job = await Jobs.findOne(filter);
    let likeCount = parseInt(job.like);
    likeCount = isNaN(likeCount) ? 0 : likeCount;

    const updateDoc = { $set: { like: likeCount + 1 } };
    const result = await Jobs.updateOne(filter, updateDoc);
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
    const education = await Educations.findOne(filter);
    let likeCount = parseInt(education.like);
    likeCount = isNaN(likeCount) ? 0 : likeCount;

    const updateDoc = { $set: { like: likeCount + 1 } };
    const result = await Educations.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the like count.");
  }
});

// COMMENTS API
app.post("/article/:postId/comments", (req, res) => {
  const { postId } = req.params;
  // const { userId, content } = req.body;
  const comment = new Comments({
    postId,
    // userId,
    comment: req.body.comment,
    createdAt: new Date(),
  });
  comment
    .save()
    .then(() => {
      res.status(201).json({ message: "Comment saved successfully" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while saving the comment" });
    });
});

app.get("/article/:postId/comments", (req, res) => {
  try {
    const { postId } = req.params;
    Comments.find({ postId }).then((comments) => {
      res.json(comments);
    });
  } catch (error) {
    res.status(500).send("An error occurred while getting the comment.");
  }
});

app.listen(port, () => {
  console.log(`atg is running on port ${port}`);
});

// File: server/index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

connectDB();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/oauth"));
app.use("/api", require("./routes/brandProfile"));
app.use("/api", require("./routes/generateContent"));
app.use("/api", require("./routes/publish"));
app.use("/api", require("./routes/chatbot"));
app.use("/api", require("./routes/marketingAgent"));

app.listen(5000, () => console.log("Server running on port 5000"));
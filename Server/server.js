require("dotenv").config();

// Importing DB connect
const connectDB = require("./db/connectDB");

// importing routes
const { userRoutes } = require("./routes/userRoute");

// Express App
const express = require("express");
const app = express();
const PORT = 3000;

// this enable hackers to not know about the technology we are using
app.disable("x-powered-by"); // less hackers know about our stack

// Cors
const cors = require("cors");

// Cookie-Parser
const cookieParser = require("cookie-parser");

// middleware
app.use(cookieParser({}));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", userRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Connecting to Database
connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Example app listening on port ${PORT}!`)
    );
  })
  .catch((error) => {
    console.log("Error while connecting to database", error);
  });

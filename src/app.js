const express = require("express");
const api = require("./routes/api");
const errorHandler = require("./middlewares/error.middleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Register API version 1
app.use("/api/v1", api);

// Handle errors
app.use(errorHandler);

module.exports = app;

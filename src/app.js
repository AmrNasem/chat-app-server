const express = require("express");
const api = require("./routes/api");
const errorHandler = require("./middlewares/error.middleware");

const app = express();
app.use(express.json());

// Register API version 1
app.use("/api/v1", api);

// Handle errors
app.use(errorHandler);

module.exports = app;

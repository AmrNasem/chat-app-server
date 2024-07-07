const express = require("express");
const userRouter = require("./user.route");

const api = express.Router();
api.use("/users", userRouter);

module.exports = api;

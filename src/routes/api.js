const express = require("express");
const userRouter = require("./user.route");
const conversationRouter = require("./conversation.route");
const messageRouter = require("./message.route");

const api = express.Router();
api.use("/users", userRouter);
api.use("/conversations", conversationRouter);
api.use("/messages", messageRouter);

module.exports = api;

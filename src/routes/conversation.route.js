const express = require("express");
const auth = require("../middlewares/auth.middleware");
const {
  createConversationCtrl,
  deleteConversationCtrl,
  getAllConversationsCtrl,
  deleteAllConversationsCtrl,
} = require("../controllers/conversation.controller");

const conversationRouter = express.Router();

conversationRouter.get("/", auth, getAllConversationsCtrl);
conversationRouter.post("/create/:memberId", auth, createConversationCtrl);
conversationRouter.delete(
  "/delete/:conversationId",
  auth,
  deleteConversationCtrl
);
conversationRouter.delete("/delete-all", deleteAllConversationsCtrl);

module.exports = conversationRouter;

const express = require("express");
const auth = require("../middlewares/auth.middleware");
const {
  sendMessageCtrl,
  getMessagesCtrl,
} = require("../controllers/message.controller");

const router = express.Router();

router.get("/:conversationId", auth, getMessagesCtrl);
router.post("/send", auth, sendMessageCtrl);

module.exports = router;

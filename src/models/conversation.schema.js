const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    members: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;

const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    conversation: {
      type: mongoose.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    received: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;

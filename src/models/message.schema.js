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
    read: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        default: [],
        unique: true,
      },
    ],
    received: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        default: [],
        unique: true,
      },
    ],
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;

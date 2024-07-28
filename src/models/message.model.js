const { createError } = require("../services/error");
const { getConversations } = require("./conversation.model");
const Conversation = require("./conversation.schema");
const Message = require("./message.schema");

const getMessages = async (conversationId, userId) => {
  const messages = await Message.find({
    conversation: conversationId,
  }).populate("conversation", "members");

  return messages;
};

const getUnreadMessages = async (userId) => {
  const conversations = await getConversations(userId);
  const conversationsIds = conversations.map((conv) => conv._id);

  return await Message.find({
    conversation: { $in: conversationsIds },
    read: { $ne: userId },
    senderId: { $ne: userId },
  }).populate("conversation", "members");
};

const readMessages = async (messagesIds, userId) => {
  const condition = { _id: { $in: messagesIds } };
  await Message.updateMany(condition, { $push: { read: userId } });

  return await Message.find(condition).populate("conversation", "members");
};

const receiveMessages = async (messagesIds, userId) => {
  const condition = { _id: { $in: messagesIds } };
  await Message.updateMany(condition, {
    $push: { received: userId },
  });

  return await Message.find(condition).populate("conversation", "members");
};

const sendMessage = async (text, conversationId, senderId) => {
  const newMessage = new Message({
    text,
    conversation: conversationId,
    senderId,
  });

  await newMessage.save();
  await Conversation.findOneAndUpdate(
    { _id: conversationId },
    { $set: { lastMessage: newMessage } }
  );
  await newMessage.populate({
    path: "conversation",
    select: "-__v",
    populate: [
      {
        path: "members",
        select: "-password",
      },
      {
        path: "lastMessage",
        select: "-__v",
        populate: { path: "conversation", select: "-__v" },
      },
    ],
  });

  return newMessage._doc;
};

module.exports = {
  sendMessage,
  getMessages,
  getUnreadMessages,
  readMessages,
  receiveMessages,
};

const { createError } = require("../services/error");
const { getConversations } = require("./conversation.model");
const Conversation = require("./conversation.schema");
const Message = require("./message.shcema");

const getMessages = async (conversationId, userId) => {
  const messages = await Message.find({
    conversation: conversationId,
  }).populate("conversation", "-__v");

  // const conversation = messages[0].conversation;

  // if (!conversation.members.find((m) => m.toString() === userId))
  //   throw createError(403, "You're not authorized");

  return messages.map((m) => ({
    ...m._doc,
    conversation: m._doc.conversation._id,
  }));
};

const getUnreadMessages = async (userId) => {
  const conversations = await getConversations(userId);
  const conversationIds = conversations.map((conv) => conv._id);

  return await Message.find({
    conversation: { $in: conversationIds },
    seen: false,
    senderId: { $ne: userId },
  });
};

const readMessages = async (conversationId, userId) => {
  await Message.updateMany(
    { conversation: conversationId, senderId: { $ne: userId } },
    { seen: true }
  );
};

const readMessage = async (msgId) => {
  return await Message.findOneAndUpdate(
    { _id: msgId },
    { seen: true },
    { new: true }
  );
};

const receiveMessages = async (userId) => {
  const conversations = await getConversations(userId);
  const conversationIds = conversations.map((conv) => conv._id);

  await Message.updateMany(
    { conversation: { $in: conversationIds }, senderId: { $ne: userId } },
    { received: true }
  );
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

  const { __v, ...formattedMessage } = newMessage._doc;
  return formattedMessage;
};

const receiveMessage = async (messageId) => {
  const updatedMessage = await Message.findOneAndUpdate(
    { _id: messageId },
    { received: true },
    { new: true }
  );
  return updatedMessage;
};

module.exports = {
  sendMessage,
  getMessages,
  getUnreadMessages,
  readMessages,
  readMessage,
  receiveMessages,
  receiveMessage,
};

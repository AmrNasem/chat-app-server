const { createError } = require("../services/error");
const Conversation = require("./conversation.schema");
const Message = require("./message.shcema");

const getConversations = async (userId) => {
  const conversations = await Conversation.find(
    {
      members: userId,
    },
    "-__v"
  ).populate("members lastMessage", "-password -__v");

  return conversations.map((c) => {
    const member = c.members.find((m) => m._id.toString() !== userId);
    return { ...c._doc, avatar: member.avatar, name: member.name };
  });
};

const createConversation = async (memberId, userId) => {
  if (memberId === userId) throw createError(400, "You can't chat your self!");

  const conversation = await Conversation.findOne(
    {
      members: { $all: [memberId, userId] },
    },
    "-__v"
  ).populate("members", "-password -__v");

  if (conversation) return { conversation: conversation._doc, exists: true };

  const newConversation = new Conversation({
    members: [userId, memberId],
  });

  await newConversation.save();
  await newConversation.populate("members", "-password -__v");

  const { __v, ...formattedConversation } = newConversation._doc;
  return { conversation: formattedConversation, exists: false };
};

const deleteConversation = async (conversationId, userId) => {
  const deletedConversation = await Conversation.findOneAndDelete({
    _id: conversationId,
    members: userId,
  });

  if (!deletedConversation)
    throw createError(404, "This conversation doesn't exist.");

  await Message.deleteMany({ conversation: conversationId });
};

module.exports = {
  deleteConversation,
  getConversations,
  createConversation,
};

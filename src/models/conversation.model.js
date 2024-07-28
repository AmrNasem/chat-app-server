const { createError } = require("../services/error");
const Conversation = require("./conversation.schema");
const Message = require("./message.schema");

const customPopulation = [
  {
    path: "members",
    select: "-__v -password",
  },
  {
    path: "lastMessage",
    select: "-__v",
    populate: { path: "conversation" },
  },
];

const getConversations = async (userId) => {
  const conversations = await Conversation.find(
    {
      members: userId,
    },
    "-__v"
  ).populate(customPopulation);

  return conversations.map((c) => {
    const member = c.members.find((m) => m._id.toString() !== userId);
    return { ...c._doc, avatar: member.avatar, title: member.name };
  });
};

const createConversation = async (memberId, userId) => {
  if (memberId === userId) throw createError(400, "You can't chat your self!");

  const conversation = await Conversation.findOne(
    {
      members: { $all: [memberId, userId] },
    },
    "-__v"
  ).populate(customPopulation);

  if (conversation) return { conversation: conversation._doc, exists: true };

  const newConversation = new Conversation({
    members: [userId, memberId],
  });

  await newConversation.save();
  await newConversation.populate(customPopulation);

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

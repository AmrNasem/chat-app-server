const {
  deleteConversation,
  getConversations,
  createConversation,
} = require("../models/conversation.model");
const Conversation = require("../models/conversation.schema");
const Message = require("../models/message.schema");

const getAllConversationsCtrl = async (req, res) => {
  const conversations = await getConversations(req.user._id);

  res.status(200).json({
    message: "Got your conversations successfully",
    payload: {
      conversations,
    },
  });
};

const createConversationCtrl = async (req, res, next) => {
  const { memberId } = req.params;

  try {
    const { conversation, exists } = await createConversation(
      memberId,
      req.user._id
    );
    const member = conversation.members.find(
      (m) => m._id.toString() === memberId
    );

    return res.status(exists ? 200 : 201).json({
      message: exists
        ? "This conversation already exists"
        : "A new conversation was created",
      payload: {
        conversation: {
          ...conversation,
          avatar: member.avatar,
          title: member.name,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const deleteConversationCtrl = async (req, res, next) => {
  const { conversationId } = req.params;
  try {
    await deleteConversation(conversationId, req.user._id);

    res.status(200).json({
      message: "Conversation deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteAllConversationsCtrl = async (req, res, next) => {
  try {
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    res.status(200).json({
      messages: "All conversations deleted",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createConversationCtrl,
  getAllConversationsCtrl,
  deleteConversationCtrl,
  deleteAllConversationsCtrl,
};

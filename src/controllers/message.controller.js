const { sendMessage, getMessages } = require("../models/message.model");

const getMessagesCtrl = async (req, res, next) => {
  const { conversationId } = req.params;
  try {
    const messages = await getMessages(conversationId, req.user._id);

    res.status(200).json({
      messages: "Got messages successfully!",
      payload: {
        messages,
      },
    });
  } catch (err) {
    next(err);
  }
};

const sendMessageCtrl = async (req, res, next) => {
  const { text, conversationId } = req.body;

  try {
    const message = await sendMessage(text, conversationId, req.user._id);

    res.status(201).json({
      message: "Message sent successfully.",
      paylaod: { message },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendMessageCtrl,
  getMessagesCtrl,
};

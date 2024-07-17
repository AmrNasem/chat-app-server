const socketIo = require("socket.io");
const socketAuth = require("../middlewares/socketAuth.middleware");
const {
  sendMessage,
  getUnreadMessages,
  receiveMessages,
  readMessages,
  receiveMessage,
} = require("../models/message.model");

const useRealTimeChat = (server) => {
  const io = socketIo(server);

  io.use(socketAuth);

  let connectedUsers = [];

  io.on("connect", async (socket) => {
    // Sending unread messages
    const unreadMessages = await getUnreadMessages(socket.user._id);
    socket.emit("unreadMessages", unreadMessages, async () => {
      await receiveMessages(socket.user._id);
      io.emit("receiveMessages");
    });

    // Reading messages
    socket.on("readConvMessages", async (conversationId, readMessagesAck) => {
      await readMessages(conversationId, socket.user._id);
      readMessagesAck(conversationId);
      socket.broadcast.emit("readMyMessages", conversationId);
    });

    // Handling Online users
    connectedUsers.push(socket.user._id);
    io.emit("users", connectedUsers);

    // Receiving messages
    socket.on("sendMessage", async ({ text, conversationId }, sentAck) => {
      const message = await sendMessage(text, conversationId, socket.user._id);
      sentAck(message);
      if (connectedUsers.length > 1) {
        socket.broadcast.emit("getMessage", message, async () => {
          const updatedMessage = await receiveMessage(message._id);
          socket.emit("myReceivedMessage", updatedMessage);
        });
      }
    });

    // Disconnecting socket
    socket.on("disconnect", () => {
      connectedUsers = connectedUsers.filter((u) => u !== socket.user._id);
      io.emit("users", connectedUsers);
    });
  });

  return io;
};

module.exports = useRealTimeChat;

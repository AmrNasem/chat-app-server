const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const socketAuth = require("./middlewares/socketAuth.middleware");
const {
  sendMessage,
  getUnreadMessages,
  receiveMessages,
  readMessages,
  receiveMessage,
  readMessage,
} = require("./models/message.model");
require("dotenv").config({ path: "./config/dev.env" });

const server = http.createServer(app);
const io = socketIo(server);

io.use(socketAuth);

let connectedUsers = [];

io.on("connect", async (socket) => {
  const unreadMessages = await getUnreadMessages(socket.user._id);
  socket.emit("unreadMessages", unreadMessages, async () => {
    await receiveMessages(socket.user._id);
    io.emit("receiveMessages");
  });

  socket.on("readConvMessages", async (conversationId, readMessagesAck) => {
    await readMessages(conversationId, socket.user._id);
    readMessagesAck(conversationId);
    socket.broadcast.emit("readMyMessages", conversationId);
  });

  // socket.on("readMessage", async (msgId, readAck) => {
  //   const updatedMessage = await readMessage(msgId);
  //   readAck(updatedMessage);
  // });

  connectedUsers.push(socket.user._id);
  io.emit("users", connectedUsers);

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter((u) => u !== socket.user._id);
    io.emit("users", connectedUsers);
  });

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
});

const port = process.env.PORT || 8000;
const MONGODB_URL = process.env.MONGODB_URL;

const startServer = async () => {
  await mongoose.connect(MONGODB_URL);

  server.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
};

startServer();

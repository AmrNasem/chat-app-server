const socketIo = require("socket.io");
const socketAuth = require("../middlewares/socketAuth.middleware");
const {
  sendMessage,
  getUnreadMessages,
  receiveMessages,
  readMessages,
} = require("../models/message.model");

const connectedUsers = new Map();
const lastSeen = new Map();

const signAck = (updatedMessages, sign = "signReceived") => {
  updatedMessages.forEach((msg) => {
    const signData = sign === "signReceived" ? msg.received : msg.read;

    const targettedSocket = connectedUsers.get(msg.senderId.toString());
    if (
      targettedSocket &&
      2 * signData.length >= msg.conversation.members.length - 1
    ) {
      targettedSocket.emit(sign, msg);
    }
  });
};

const useRealTimeChat = (server) => {
  const io = socketIo(server);
  io.use(socketAuth);

  io.on("connect", async (socket) => {
    // Register a new socket
    connectedUsers.set(socket.user._id, socket);
    lastSeen.delete(socket.user._id);

    // Handling Online users
    io.emit("users", [...connectedUsers.keys()]);

    // Sending unread messages
    const unreadMessages = await getUnreadMessages(socket.user._id);
    socket.emit("unreadMessages", unreadMessages, async () => {
      const updatedMessages = await receiveMessages(
        unreadMessages.map((uMsg) => uMsg._id.toString()),
        socket.user._id
      );
      signAck(updatedMessages);
    });

    // Receiving messages
    socket.on("sendMessage", async ({ text, conversationId }, sentAck) => {
      const message = await sendMessage(text, conversationId, socket.user._id);
      sentAck(message);

      const conversation = message.conversation._doc;
      const member = conversation.members.find(
        (member) => member._id.toString() === socket.user._id
      );

      const formattedMessage = {
        ...message,
        conversation: {
          ...conversation,
          avatar: member.avatar,
          title: member.name,
        },
      };

      conversation.members.forEach((member) => {
        const targettedSocket = connectedUsers.get(member._id.toString());
        if (targettedSocket && member._id.toString() !== socket.user._id) {
          targettedSocket.emit("getMessage", formattedMessage, async () => {
            const updatedMessages = await receiveMessages(
              [message._id],
              socket.user._id
            );

            signAck(updatedMessages);
          });
        }
      });
    });

    // Reading messages
    socket.on("readMessages", async (messagesIds, readMessagesAck) => {
      const updatedMessages = await readMessages(messagesIds, socket.user._id);
      readMessagesAck(updatedMessages);
      signAck(updatedMessages, "signRead");
    });

    // Typing a message
    socket.on("typeMessage", (conversation) => {
      conversation.members.forEach((member) => {
        const targettedSocket = connectedUsers.get(member._id);
        if (targettedSocket && member._id !== socket.user._id)
          targettedSocket.emit("typing", { conversation, member });
      });
    });

    // // Last seen
    // socket.on("lastSeen", (members, lastSeenAck) => {
    //   console.log([...lastSeen.values()]);
    //   const lastSeenMembers = members
    //     .filter((member) => member._id !== socket.user._id)
    //     .map((member) => {
    //       const date = lastSeen.get(member._id);
    //       if (date) return { memberId: member._id, date };
    //     });
    //   console.log(lastSeenMembers);
    //   lastSeenAck(lastSeenMembers);
    // });

    // Disconnecting socket
    socket.on("disconnect", () => {
      connectedUsers.delete(socket.user._id);
      lastSeen.set(socket.user._id, new Date().toUTCString());
      io.emit("users", [...connectedUsers.keys()]);
    });
  });

  return io;
};

module.exports = useRealTimeChat;

const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");
const useRealTimeChat = require("./routes/chat.route");
require("dotenv").config({ path: "./config/dev.env" });

const server = http.createServer(app);

useRealTimeChat(server);

const port = process.env.PORT || 8000;
const MONGODB_URL = process.env.MONGODB_URL;

const startServer = async () => {
  await mongoose.connect(MONGODB_URL);

  server.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
};

startServer();

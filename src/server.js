const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/dev.env" });

const server = http.createServer(app);

const port = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;

const startServer = async () => {
  await mongoose.connect(process.env.MONGODB_URL);

  server.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
};

startServer();

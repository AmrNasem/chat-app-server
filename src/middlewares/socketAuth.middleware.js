const jwt = require("jsonwebtoken");
const socketAuth = (socket, next) => {
  let token;
  socket.handshake.headers.cookie.split(";").find((c) => {
    const condition = c.split("=")[0].trim() === "access_token";
    if (condition) token = c.split("=")[1].trim();
    return condition;
  });
  if (!token) token = socket.handshake.query.token;

  try {
    if (!token) throw createError(401, "You should login first!");

    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (!user) throw createError(400, "Invalid access token!");
    socket.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = socketAuth;

const socketErrorHandler = (err, socket, next) => {
  next();
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  socket.emit("error", { error: message, statusCode });
};

module.exports = socketErrorHandler;

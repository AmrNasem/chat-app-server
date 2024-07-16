const jwt = require("jsonwebtoken");
const { createError } = require("../services/error");

const auth = async (req, res, next) => {
  const token =
    req.cookies.access_token || req.headers.authorization?.split(" ")[1];

  try {
    if (!token) throw createError(401, "You should login first!");

    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (!user) throw createError(400, "Invalid access token!");
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;

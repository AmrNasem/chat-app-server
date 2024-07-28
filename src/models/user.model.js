const { createError } = require("../services/error");
const User = require("./user.schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getConversations } = require("./conversation.model");

const getAllUsers = async () => {
  return await User.find({}, "-password -__v");
};

const login = async (email, password) => {
  const user = await User.findOne({ email }, "-__v");
  if (!user) throw createError(400, "Invalid email or password");
  const { password: pass, ...secureUser } = user._doc;

  const isIdentical = await bcrypt.compare(password, pass);
  if (!isIdentical) throw createError(400, "Invalid email or password");

  const token = jwt.sign({ _id: secureUser._id }, process.env.JWT_SECRET);
  return { user: secureUser, token };
};

const signup = async (data) => {
  const { email, password, name } = data;
  const user = await User.findOne({ email });

  if (user) throw createError(400, "This email was already taken!");
  const hashedPassword = await bcrypt.hash(password, 8);
  const newUser = new User({ email, password: hashedPassword, name });
  await newUser.save();
  const { password: pass, __v, ...secureUser } = newUser._doc;
  return secureUser;
};

const getSuggestions = async (userId) => {
  const conversations = await getConversations(userId);
  const userIds = conversations.flatMap((conv) =>
    conv.members.flatMap((member) =>
      member._id !== userId ? [member._id] : []
    )
  );
  return await User.find({ _id: { $nin: userIds, $ne: userId } });
};

module.exports = { getAllUsers, login, signup, getSuggestions };

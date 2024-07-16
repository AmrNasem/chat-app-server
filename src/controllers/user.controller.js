const User = require("../models/user.schema");
const bcrypt = require("bcrypt");
const { createError } = require("../services/error");
const jwt = require("jsonwebtoken");

const getAllUsersCtrl = async (req, res) => {
  const users = await User.find({}, "-password -__v");

  res.status(200).json({
    message: "Got your users successfully",
    payload: {
      users,
    },
  });
};

const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }, "-__v");
  try {
    if (!user) throw createError(400, "Invalid email or password");
    const { password: pass, ...secureUser } = user._doc;

    const isIdentical = await bcrypt.compare(password, pass);
    if (!isIdentical) throw createError(400, "Invalid email or password");

    const token = jwt.sign({ _id: secureUser._id }, process.env.JWT_SECRET);
    return res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .cookie("user_data", JSON.stringify(secureUser))
      .status(200)
      .json({
        message: "You logged in successfully.",
        payload: { user: secureUser, token },
      });
  } catch (err) {
    next(err);
  }
};

const signupCtrl = async (req, res, next) => {
  const { email, password, name } = req.body;

  const user = await User.findOne({ email });

  try {
    if (user) throw createError(400, "This email was already taken!");
    const hashedPassword = await bcrypt.hash(password, 8);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();
    const { password: pass, __v, ...secureUser } = newUser._doc;
    return res.status(201).json({
      message: "Your account was created successfully.",
      payload: { user: secureUser },
    });
  } catch (err) {
    next(err);
  }
};

const logoutCtrl = (req, res) => {
  res
    .clearCookie("access_token")
    .clearCookie("user_data")
    .status(200)
    .json({ message: "You logged out successfully!" });
};

module.exports = {
  loginCtrl,
  signupCtrl,
  logoutCtrl,
  getAllUsersCtrl,
};

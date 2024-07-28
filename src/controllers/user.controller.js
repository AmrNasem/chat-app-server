const {
  getAllUsers,
  login,
  signup,
  getSuggestions,
} = require("../models/user.model");

const getAllUsersCtrl = async (req, res, next) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      message: "Got your users successfully",
      payload: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getSuggestionsCtrl = async (req, res, next) => {
  try {
    const suggestions = await getSuggestions(req.user._id);
    res.status(200).json({
      message: "Got your suggestions successfully!",
      payload: {
        suggestions,
      },
    });
  } catch (err) {
    next(err);
  }
};

const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await login(email, password);

    return res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .cookie("user_data", JSON.stringify(user))
      .status(200)
      .json({
        message: "You logged in successfully.",
        payload: { user, token },
      });
  } catch (err) {
    next(err);
  }
};

const signupCtrl = async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    const user = await signup({ email, password, name });
    return res.status(201).json({
      message: "Your account was created successfully.",
      payload: { user },
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
  getSuggestionsCtrl,
};

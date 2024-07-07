const User = require("../models/user.schema");

const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }, "-__v");
  try {
    if (!user) throw createError(400, "Invalid email or password");
    const { password: pass, _id, ...secureUser } = user;

    const isIdentical = await bcrypt.compare(password, pass);
    if (!isIdentical) throw createError(400, "Invalid email or password");

    const token = jwt.sign({ _id }, process.env.TOKEN_SECRET_KEY);
    return res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .cookie("user_data", secureUser)
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
    const hashedPassword = bcrypt.hash(password);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();
    const { password, __v, ...secureUser } = newUser._doc;
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
};

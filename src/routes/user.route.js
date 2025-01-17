const express = require("express");
const User = require("../models/user.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  loginCtrl,
  signupCtrl,
  logoutCtrl,
  getAllUsersCtrl,
  getSuggestionsCtrl,
} = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

const userRouter = express.Router();

userRouter.post("/login", loginCtrl);
userRouter.post("/signup", signupCtrl);
userRouter.post("/logout", auth, logoutCtrl);
userRouter.get("/", auth, getAllUsersCtrl);
userRouter.get("/suggestions", auth, getSuggestionsCtrl);

module.exports = userRouter;

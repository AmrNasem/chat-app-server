const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      required: true,
      type: String,
    },
    name: {
      required: true,
      type: String,
    },
    avatar: {
      type: String,
      default:
        "https://www.citypng.com/public/uploads/preview/black-user-member-guest-icon-701751695037011q8iwf4mjbn.png",
    },
  },
  { timeStamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;

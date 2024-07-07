const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
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
      default:
        "https://www.citypng.com/public/uploads/preview/black-user-member-guest-icon-701751695037011q8iwf4mjbn.png",
      type: Buffer,
    },
  },
  { timeStamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;

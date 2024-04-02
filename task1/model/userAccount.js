const mongoose = require("mongoose");

const userAccountSchema = new mongoose.Schema({
  accountName: {
    type: String,
  },
});

module.exports = mongoose.model("userAccount", userAccountSchema);

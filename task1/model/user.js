// first name, DOB, address, phone number, state, zip code, email, gender, userType

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  DOB: {
    type: String,
  },
  address: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  email: {
    type: String,
    unique: false,
  },
  gender: {
    type: String,
    default: "",
  },
  userType: {
    type: String,
  },
});

module.exports = mongoose.model("user", userSchema);

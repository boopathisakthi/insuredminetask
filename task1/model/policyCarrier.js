const mongoose = require("mongoose");

const policyCarrierSchema = new mongoose.Schema({
  companyName: {
    type: String,
  },
});

module.exports = mongoose.model("policyCarrier", policyCarrierSchema);

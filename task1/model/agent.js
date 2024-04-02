const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    agentName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("agent", agentSchema);

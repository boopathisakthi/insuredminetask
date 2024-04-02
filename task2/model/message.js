const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    scheduledAt: Date
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("agent", agentSchema);
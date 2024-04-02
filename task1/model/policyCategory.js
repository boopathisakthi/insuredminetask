const mongoose = require("mongoose");

const policyCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
  },
});

module.exports = mongoose.model("policyCategory", policyCategorySchema);

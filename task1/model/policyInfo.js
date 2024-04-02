// policy number, policy start date, policy end date, policy category- collection id, company collection id, and user id.
const mongoose = require("mongoose");

const policyInfoSchema = new mongoose.Schema({
  policyNumber: {
    type: String,
  },
  policyStartDate:{
    type:Date,
  },
  policyEndDate:{
    type:Date
  },
  policyCategoryId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:`policyCategory`
  },
  companyId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:`policyCarrier`
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  }
});

module.exports = mongoose.model("policyInfo", policyInfoSchema);

 
const express = require("express");
const route = express.Router();
const multer = require("multer");

const {
  formatExcel,
  handleMessage,
  convertExcelDateToJSDate,
  removeDuplicatesInPolicyCategory,
  removeDuplicatesInCompany,
  getPolicyCategoryId,
  getUserId,
  getCompanyId,
} = require("../helper/common");

const agentModel = require("../model/agent");
const userModel = require("../model/user");
const userAccountModel = require("../model/userAccount");
const policyCategoryModel = require("../model/policyCategory");
const policyCarrierModel = require("../model/policyCarrier");
const policyInfoModel = require("../model/policyInfo");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}.csv`);
  },
});

const upload = multer({ storage });

route.post("/", upload.single("sheet"), async (req, res) => {
  try {
    const result = await handleMessage(req.file.path);
    const data = formatExcel(result);
    const agentDetails = [];
    const userDetails = [];
    const userAccountDetails = [];
    let policyCategoryDetails = [];
    let policyCarrierDetails = [];
    data.forEach((e) => {
      agentDetails.push({ agentName: e.agent });
      userDetails.push({
        firstName: e.firstname,
        DOB: e.dob,
        address: e.address,
        phoneNumber: e.phone,
        state: e.state,
        zipCode: e.zip,
        email: e.email,
        gender: e.gender,
        userType: e.userType,
      });
      userAccountDetails.push({ accountName: e.account_name });
      policyCategoryDetails.push({ categoryName: e.category_name });
      policyCarrierDetails.push({ companyName: e.company_name });
    });

    policyCategoryDetails = removeDuplicatesInPolicyCategory(
      policyCategoryDetails
    );

    policyCarrierDetails = removeDuplicatesInCompany(policyCarrierDetails);

    await agentModel.insertMany(agentDetails);
    const userResult = await userModel.insertMany(userDetails);
    await userAccountModel.insertMany(userAccountDetails);
    const policyCategoryResult = await policyCategoryModel.insertMany(
      policyCategoryDetails
    );
    const policyCarrierResult = await policyCarrierModel.insertMany(
      policyCarrierDetails
    );
    const policyInfoDetails = data.map((e) => {
      return {
        policyNumber: e.policy_number,
        policyStartDate: convertExcelDateToJSDate(e.policy_start_date),
        policyEndDate: convertExcelDateToJSDate(e.policy_end_date),
        policyCategoryId: getPolicyCategoryId(
          data,
          policyCategoryResult,
          e.policy_number
        ),
        companyId: getCompanyId(data, policyCarrierResult, e.policy_number),
        userId: getUserId(data, userResult, e.policy_number),
      };
    });
    const policyInfoResult = await policyInfoModel.insertMany(
      policyInfoDetails
    );
    res.status(200).json({
      message: "Excel data inserted successfully",
      data: { policyInfoResult },
    });
  } catch (error) {
    console.error("Error in insert:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

route.get("/", async (req, res) => {
  try {
    const userName = req.query.username;
    const user = await userModel.findOne({ firstName: userName });
    if (user) {
      console.log({ userId: user._id });
      const policyDetail = await policyInfoModel.findOne({ userId: user._id });
      if (policyDetail)
        res.status(200).json({
          message: "data retrieved",
          data: {
            name: userName,
            policyNumber: policyDetail.policyNumber,
            policyStartDate: policyDetail.policyStartDate,
            policyEndDate: policyDetail.policyEndDate,
          },
        });
      else
        res
          .status(404)
          .json({ message: "Policy detail not found", data: user });
    } else res.status(404).json({ message: "username not found" });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

route.get("/all-user", async (req, res) => {
  try {
    const aggregatedPolicies = await policyInfoModel.aggregate([
      {
        $lookup: {
          from: "users", // Name of the User collection
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user", // Deconstruct the user array created by $lookup
      },
      {
        $lookup: {
          from: "policycarriers", // Name of the Company collection
          localField: "companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: "$company", // Deconstruct the company array created by $lookup
      },
      {
        $lookup: {
          from: "policycategories", // Name of the Company collection
          localField: "policyCategoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category", // Deconstruct the company array created by $lookup
      },
      {
        $group: {
          _id: "$_id", // Group policies by user ID
          user: { $first: "$user" }, // Include user details
          company: { $first: "$company" }, // Include company details
          category: { $first: "$category" },
          policyNumber: { $first: "$policyNumber" }, // Include policyNumber
          policyStartDate: { $first: "$policyStartDate" }, // Include policyStartDate
          policyEndDate: { $first: "$policyEndDate" }, // Include policyEndDate
        },
      },
      {
        $project: {
          policyNumber: 1,
          policyStartDate: {
            $dateToString: { format: "%d-%m-%Y", date: "$policyStartDate" },
          },
          policyEndDate: {
            $dateToString: { format: "%d-%m-%Y", date: "$policyEndDate" },
          },
          user: {
            _id: "$user._id",
            firstName: "$user.firstName",
            email: "$user.email",
            // Include other user fields as needed
          },
          company: {
            _id: "$company._id",
            companyName: "$company.companyName",
            // Include other company fields as needed
          },
          category: {
            _id: "$category._id",
            categoryName: "$category.categoryName",
            // Include other category fields as needed
          },
        },
      },
    ]);

    res
      .status(200)
      .json({ data: aggregatedPolicies, message: "Data retrieved" });
  } catch (error) {
    console.error("Error fetching aggregated policies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = route;

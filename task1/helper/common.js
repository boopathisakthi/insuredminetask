const { Worker } = require("node:worker_threads");
const moment = require("moment");
const formatExcel = (data) => {
  // Extract keys and values
  const keys = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    data[i].forEach((value, index) => {
      obj[keys[index]] = value;
    });
    result.push(obj);
  }
  return result;
};

const handleMessage = (filePath) => {
  const worker = new Worker("./helper/worker.js", {
    workerData: "./" + filePath,
  });

  const messagePromise = new Promise((resolve) => {
    // Resolve the promise with the message data
    worker.on("message", (data) => {
      resolve(data);
    });
  });

  worker.on("error", (error) => {
    console.error(error);
    res.status(500).send("Internal Server Error");
  });
  return messagePromise;
};

const excelToDate = (excelDate) => {
  const unixTimestamp = (excelDate - 25569) * 86400 * 1000;
  return new Date(unixTimestamp);
};

function convertExcelDateToJSDate(excelDate) {
  if (typeof excelDate === "number") {
    return excelToDate(excelDate);
  } else {
    // Otherwise, assume it's a regular date string
    return moment(excelDate, "DD-MM-YYYY").toISOString();
  }
}

const removeDuplicatesInPolicyCategory = (data) => {
  return [...new Set(data.map((e) => e.categoryName))].map((categoryName) => ({
    categoryName,
  }));
};

const removeDuplicatesInCompany = (data) => {
  return [...new Set(data.map((e) => e.companyName))].map((companyName) => ({
    companyName,
  }));
};

const getPolicyCategoryId = (data, categoryDetails, policyId) => {
  const userData = data.find((e) => e.policy_number == policyId);
  const category = categoryDetails.find(
    (e) => e.categoryName == userData.category_name
  );
  return category._id;
};

const getCompanyId = (data, companyDetails, policyId) => {
  const userData = data.find((e) => e.policy_number == policyId);
  const company = companyDetails.find(
    (e) => e.companyName == userData.company_name
  );
  return company._id;
};

const getUserId = (data, users, policyId) => {
  const userData = data.find((e) => e.policy_number == policyId);
  const user = users.find((e) => e.firstName == userData.firstname);
  return user._id;
};

module.exports = {
  formatExcel,
  handleMessage,
  convertExcelDateToJSDate,
  removeDuplicatesInPolicyCategory,
  removeDuplicatesInCompany,
  getPolicyCategoryId,
  getCompanyId,
  getUserId,
};

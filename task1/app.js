require("./config/db.js");
const express = require("express");
const app = express();

//model import part
const AgentModel = require("./model/agent.js");

//route import part
const policyRoute = require("./routes/policy.js");

app.use("/policy", policyRoute);

app.get("/", (req, res) => {
  AgentModel.create({ agentName: "Boopathi" });
  res.send("Hai Bro I am working proper");
});

app.listen(3000, (err) => {
  if (err) console.log(`application facing issue not able to start`);
  else console.log(`Application started in port 3000`);
});

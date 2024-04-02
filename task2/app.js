const express = require("express");
const app = express();
const os = require("os");
const { exec } = require("child_process");
const osUtils = require("os-utils");
const mongoose = require("mongoose");
const schedule = require('node-schedule');
const messageModel = require("./model/message");
app.use(express.json());
mongoose.connect(
  "mongodb+srv://boopathisakthi52:iiIdVu2PufpbFRft@cluster0.xfkx6oz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
// Function to restart the server
function restartServer() {
  console.log("Restarting server...");
  exec("pm2 restart task1", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting server: ${error.message}`);
      return;
    }
    console.log("Server restarted successfully");
  });
}

// Function to monitor CPU usage
function monitorCPU() {
  osUtils.cpuUsage((cpuUsage) => {
    console.log(`CPU Usage: ${cpuUsage * 100}%`);
    if (cpuUsage >= 0.2) {
      // If CPU usage exceeds 70%
      restartServer(); // Restart the server
    }
  });
}

// POST route to schedule a message
app.post("/schedule-message", (req, res) => {
  const { message, day, time } = req.body;
  console.log(req.body);
  // Validate input parameters
  if (!message || !day || !time) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Schedule the insertion of the message into the database
  const scheduledDate = new Date(`${day} ${time}`);
  schedule.scheduleJob(scheduledDate, async () => {
    try {
      // Insert the message into the database
      await messageModel.create({ message, scheduledAt: scheduledDate });
      console.log("Message inserted into the database:", message);
    } catch (error) {
      console.error("Error inserting message into the database:", error);
    }
  });
  res.status(200).json({ message: "Message scheduled successfully" });
});

// Start monitoring CPU usage every 5 seconds
setInterval(monitorCPU, 5000);

app.listen(3001, function (req, res) {
  console.log("Application run port:" + 3001);
});

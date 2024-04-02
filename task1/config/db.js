const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://boopathisakthi52:iiIdVu2PufpbFRft@cluster0.xfkx6oz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Data base connected");
  })
  .catch((err) => {
    console.log(err);
  });

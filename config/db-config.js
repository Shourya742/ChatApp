const mongoose = require("mongoose");
const { DB_URI } = require("./server-config");
const connect = async () => {
  await mongoose.connect(DB_URI);
  console.log("Successfully connected to database");
};

module.exports = connect;

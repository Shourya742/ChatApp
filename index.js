const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { DbConnect } = require("./config");
const { groupModel, chatModel } = require("./models");

app.set("view engine", "ejs");
// app.use("/", express.static(__dirname + "/public/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("join_room", (data) => {
    console.log("Joining a room", data.roomid);
    socket.join(data.roomid);
  });
  socket.on("new_msg", async (data) => {
    await chatModel.create({
      roomid: data.roomid,
      content: data.message,
      sender: data.sender,
    });
    io.to(data.roomid).emit("msg_rcvd", data);
  });
  //   socket.on("from_client", () => {
  //     console.log("Client is calling");
  //   });
  //   setInterval(function f() {
  //     socket.emit("from_server");
  //   }, 3000);
});

app.get("/chat/:roomid/:user", async (req, res) => {
  const group = await groupModel.findById(req.params.roomid);
  const chats = await chatModel.find({
    roomid: req.params.roomid,
  });
  console.log(chats);
  console.log(group);
  res.render("index", {
    roomid: req.params.roomid,
    user: req.params.user,
    groupname: group.name,
    previousmsgs: chats,
  });
});

app.get("/group", async (req, res) => {
  res.render("group");
});

app.post("/group", async (req, res) => {
  console.log(req.body);
  await groupModel.create({
    name: req.body.name,
  });
  res.redirect("/group");
});

server.listen(3000, async () => {
  console.log("Listening on PORT:3000");
  await DbConnect();
});

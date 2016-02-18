var express = require("express"); // Routes
var app = express();
var http = require("http");
var server = http.Server(app);
var io = require("socket.io")(server); // Socket io

io.sockets.on("connection", function(socket) {
  console.log("User connected");

  socket.on("connect", function(data){
    console.log("ok");
    console.log("user");
    console.log("gravatar");
    console.log(data.user + "est connecté");
    socket.emit("newUser", data);
  });

  socket.on("message", function(user, message) {
    console.log(user + ": " + message);
    socket.emit("newMessage", message)
  });

});

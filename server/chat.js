var express = require("express"); // Routes
var app = express();
var http = require("http");
var server = http.Server(app);
var io = require("socket.io")(server); // Socket io

io.on("connection", function(socket) {
  socket.on("connect", function(user) {
    console.log(user + "is connected");
  });
});

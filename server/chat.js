var express = require("express"); // Routes
var app = express();
var http = require("http");
var server = http.Server(app);
var wsServer = require("ws").server;
//var io = require("socket.io")(server); // Socket io

console.log("chat.js");

var ws = new wsServer({
  httpServer: server,
  port: 8080
});

ws.onopen = function(e) {
  console.log("Connecté au serveur");

  ws.onmessage = function(data) {
    ws.send(data);
  }
}

ws.onclose = function(e) {
  console.log(e);
  console.log("Déconnecté du serveur");
}
//alert("chat.js");

/*io.on("connection", function(socket) {
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

});*/

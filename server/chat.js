var express = require("express"); // Routes
var app = express();
var http = require("http");
var server = http.Server(app);
var io = require("socket.io")(server); // Socket io

io.on("connection", function(socket) {
  var me;
  var users = [];
  for(var i in users) {
    io.emit("newUser", users[i]);
  }

  socket.on("login", function(user){
    users.push(user);
    me = user;
    console.log(me.pseudo + " est connecté");
    user.gravatar = gravatar.url(user.mail, {s:145, d:'wavatar'});
    io.emit("newUser", user);
  });

  socket.on("message", function(message) {
    message.pseudo = me.pseudo;
    var date = new Date();
    var hours = date.getHours();
    var min = date.getMinutes();
    if (hours.length != 2) hours = 0 + hours;
    if (min.length != 2) min = 0 + min;
    message.time = hours + "h" + min;
    io.emit("newMessage", message)
  });

  socket.on("disconnect", function() {
    console.log(me + " est déconnecté");
    var index = users.indexOf(me);
    users.splice(index, 1);
  })

});
